import axios, { AxiosError, AxiosResponse } from 'axios'
import { Api, Config, LoginBody } from './api'
import chalk from 'chalk'
import { a } from './assertion'

const DEBUG_CLAIMS = false
const LOG_RESPONSE = true
const LOG_BODY = true
const BASE_URL = 'http://localhost:8080'

const api = new Api(new Config(axios.create({ baseURL: BASE_URL })))

class IdManager<Id extends string | number> {
  private ids: Record<string, Id> = {}

  set(key: string, value: Id) {
    const t = typeof value
    if (t !== 'number' && t !== 'string') throw Error(`Invalid id value: ${key} : ${value}`)
    this.ids[key] = value
  }

  get(key: string): Id {
    return this.ids[key]
  }

  clear() {
    this.ids = {}
  }

  collect = (name: string, resFn: (res: AxiosResponse) => Id) => {
    return (res: AxiosResponse) => {
      const value = resFn(res)
      this.set(name, value)
      return res
    }
  }
}

const adminCredentials = {
  email: 'admin@test.com',
  password: '123mudar',
}
const secretaryCredencials = {
  email: 'secretary@test.com',
  password: '456@Mudar',
}

const ids = new IdManager<string>()

function openService<S extends keyof Api>(serviceName: S): Api[S] {
  const result: any = {}
  const service = api[serviceName] as any
  const proto = Object.getPrototypeOf(service)
  for (const key of Object.getOwnPropertyNames(proto)) {
    if (key === 'constructor') continue
    if (typeof service[key] === 'function') {
      result[key] = service[key].bind(service)
    }
  }
  return result
}

function acceptError(catchFn: (error: AxiosError) => boolean) {
  return (error: unknown) => {
    if (!error || typeof error != 'object') throw error
    if ('isAxiosError' in error && !catchFn(error as AxiosError)) throw error
    console.log(chalk.green('Error catched successfully'))
  }
}

function acceptErrorCode(statusCode: number) {
  return acceptError((error) => error.status === statusCode)
}

async function login(data: LoginBody, role: string = '') {
  const { accessToken } = await api.auth.login(data).then((res) => res.data)
  api.config.instance.defaults.headers['authorization'] = `Bearer ${accessToken}`
  if (DEBUG_CLAIMS) {
    await a(api.test.debugClaims()).assert((res) => {
      if (role.length > 0) {
        const roleItem = res.data.find(
          (it: any) => it.type === 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
        )
        return roleItem.value === role
      }
      return true
    }, `role != ${role}`)
  }
}

async function logout() {
  delete api.config.instance.defaults.headers['authorization']
}

async function setup() {
  class SimpleAxiosError extends Error {
    constructor(public statusCode: number, public message: string) {
      super(message)
    }
  }

  function logResponse(paint: (...args: unknown[]) => string, res: AxiosResponse) {
    const uri = axios.getUri(res.config)
    const method = res.config.method?.toUpperCase() ?? 'GET'
    const statusCode = res.status
    console.log(paint(`${statusCode} [${method}] ${uri}`))
    if (LOG_BODY && res.config?.data) console.log(paint('BODY:', res.config?.data))
    while (LOG_RESPONSE) {
      if (typeof res.data === 'string' && res.data.length === 0) break
      if (res.data === null || res.data === undefined) break
      console.log('RESPONSE:', JSON.stringify(res.data, null, 2))
      break
    }
    return res
  }

  function logError(error: unknown) {
    if (!error || typeof error !== 'object') throw error
    if (!('isAxiosError' in error)) throw error
    const axiosError = error as AxiosError
    if (!axiosError.response) throw error
    logResponse(chalk.red, axiosError.response)
    const simpleError = new SimpleAxiosError(
      axiosError.status ?? -1,
      axiosError.cause?.message ?? axiosError.message ?? 'unknown',
    )
    simpleError.stack = axiosError.stack
    throw simpleError
  }

  api.config.instance.interceptors.response.use(
    (response) => logResponse(chalk.green, response),
    (error) => logError(error),
  )
}

async function init() {
  await api.health.healthCheck()
  await api.test.stats()
  await api.test.init()
}

async function admin_manage_secretaries() {
  const { get, list, count, create, update, remove } = openService('secretaries')

  const saveId = (name: string) => ids.collect(name, (res) => res.data.id)
  const fields = ['name', 'email', 'phone', 'cpf', 'cnpj', 'birthdate']

  const secretaryData = {
    name: 'Secretary Test',
    ...secretaryCredencials,
    birthdate: '2000-10-10',
    cnpj: '08130896000135',
    cpf: '72730805001',
    phone: '119876543210',
  }
  const invalidSecretaryData = {
    name: '',
    email: '@x',
    password: '123456',
    phone: 'X',
    cpf: '11111111111',
    cnpj: 'X',
    birthdate: 'X',
  }

  await login(adminCredentials, 'admin')
  {
    await a(count()).bodyNumber(0)

    await a(create(secretaryData)).compare(secretaryData, fields, []).then(saveId('0'))
    await a(count()).bodyNumber(1)
    await a(get(ids.get('0'))).compare(secretaryData, fields, [])

    await a(create(invalidSecretaryData)).catch(acceptErrorCode(400))
    await a(count()).bodyNumber(1)

    await a(list({ page: 0, pageSize: 1 })).bodyLength((len) => len > 0)
    await a(list({ page: 1, pageSize: 1 })).bodyLength((len) => len === 0)

    await a(
      update(ids.get('0'), {
        name: secretaryData.name + ' Updated',
        email: secretaryData.email,
        password: undefined, // no update
        phone: '44' + secretaryData.phone.slice(2),
        cpf: secretaryData.cpf,
        cnpj: secretaryData.cnpj,
        birthdate: secretaryData.birthdate,
      }),
    )
      .undefinedField('password')
      .compare(secretaryData, fields, ['name', 'phone'])

    await a(get(ids.get('0')))
      .undefinedField('password')
      .compare(secretaryData, fields, ['name', 'phone'])

    await a(remove(ids.get('0'))).statusCode(204)
    await a(count()).bodyNumber(0)
  }
  {
    // side effect
    await create(secretaryData).then(saveId('admin'))
  }
  await logout()
}

async function secretary_manage_specializations() {
  const list: typeof api.specializations.list = () => api.specializations.list()
  const create: typeof api.specializations.create = (data) => api.specializations.create(data)
  const update: typeof api.specializations.update = (id, data) => api.specializations.update(id, data)
  const remove: typeof api.specializations.remove = (id) => api.specializations.remove(id)

  const saveId = (name: string) => ids.collect(name, (res) => res.data)

  await login(secretaryCredencials, 'secretary')
  {
    await a(list()).bodyLength((len) => len === 0)

    await a(create({ name: 'Specialization A' })).then(saveId('0'))
    await a(list()).bodyLength((len) => len === 1)
    await a(create({ name: 'Specialization B' })).then(saveId('1'))
    await a(list()).bodyLength((len) => len === 2)

    await a(create({ name: '' })).catch(acceptErrorCode(400))
    await a(list()).bodyLength((len) => len === 2)

    await a(update(ids.get('0'), { name: 'Specialization A Updated' })).notEqualValue('name', 'Specialization A')

    await a(remove(ids.get('0'))).statusCode(204)
    await a(list()).bodyLength((len) => len === 1)

    await a(remove(ids.get('0'))).catch(acceptErrorCode(404))
    await a(list()).bodyLength((len) => len === 1)

    await a(remove(ids.get('1'))).statusCode(204)
    await a(list()).bodyLength((len) => len === 0)
  }
  {
    // side effect
    await create({ name: 'SPA' }).then(saveId('SPA'))
    await create({ name: 'SPB' }).then(saveId('SPB'))
  }
  await logout()
}

async function secretary_manage_service_available() {
  const { get, list: listGroups, _count, create, update, remove } = openService('servicesAvailable')

  const saveId = (name: string) => ids.collect(name, (res) => res.data)
  const toDel = (res: AxiosResponse) => {
    idsToDelete.push(res.data)
    return res
  }

  const idsToDelete: string[] = []

  await login(secretaryCredencials, 'secretary')
  {
    await a(_count()).bodyNumber(0)
    await a(listGroups()).bodyLength((len) => len === 2)

    await create({ name: 'SA_SPA', specializationId: ids.get('SPA') }).then(toDel)
    await create({ name: 'SB_SPA', specializationId: ids.get('SPA') }).then(toDel)
    await create({ name: 'SC_SPA', specializationId: ids.get('SPA') }).then(toDel)
    await create({ name: 'SC_SPA', specializationId: ids.get('SPA') }).catch(acceptErrorCode(400))

    await create({ name: 'SA_SPB', specializationId: ids.get('SPB') }).then(toDel)
    await create({ name: 'SB_SPB', specializationId: ids.get('SPB') }).then(toDel)
    await create({ name: 'SC_SPB', specializationId: ids.get('SPB') }).then(saveId('0'))

    await a(_count()).bodyNumber(6)

    await a(get(ids.get('0'))).equalValue('serviceName', 'SC_SPB')
    await a(update(ids.get('0'), { name: 'SC_SPB_U' })).notEqualValue('serviceName', 'SC_SPB')

    await a(get(ids.get('0'))).equalValue('serviceName', 'SC_SPB_U')
    await remove(ids.get('0'))

    await a(listGroups()).bodyLength((len) => len === 2)
    await a(_count()).bodyNumber(5)

    for await (const id of idsToDelete) {
      await a(remove(id)).statusCode(204)
    }
    await a(_count()).bodyNumber(0)
  }
  {
    console.log(chalk.yellow('Extra feature:'))
    const res = await create({ name: 'Service X', specialization: 'Specialization X' })
    await a(listGroups()).bodyLength((len) => len === 3)

    const { data: sn } = await get(res.data)
    await api.servicesAvailable.remove(sn.serviceNameId)
    await api.specializations.remove(sn.specializationId)
    await a(listGroups()).bodyLength((len) => len === 2)
  }
  {
    // side effect
    await create({ name: 'SA_SPA', specializationId: ids.get('SPA') }).then(saveId('SA_SPA'))
    await create({ name: 'SB_SPA', specializationId: ids.get('SPA') }).then(saveId('SB_SPA'))

    await create({ name: 'SA_SPB', specializationId: ids.get('SPB') }).then(saveId('SA_SPB'))
    await create({ name: 'SB_SPB', specializationId: ids.get('SPB') }).then(saveId('SB_SPB'))
  }
  await logout()
}

async function secretary_manage_service_groups() {
  const { list: listGroups } = openService('serviceGroups')

  await login(secretaryCredencials, 'secretary')
  {
    await a(listGroups()).bodyLength((len) => len === 2)
  }
  await logout()
}

async function secretary_manage_specialists() {
  const { get, list, count, create, update, remove, listServices } = openService('specialists')

  const saveId = (name: string) => ids.collect(name, (res) => res.data)
  const fields = ['name', 'email', 'phone', 'cpf', 'cnpj', 'birthdate']

  const specialistData = {
    name: 'Specialist Test',
    email: 'specialist@test.com',
    phone: '219876543210',
    cnpj: '16833374000128',
    cpf: '96156338012',
    birthdate: '1999-09-09',
    services: [],
  }
  const specialistDataWithServices = {
    ...specialistData,
    services: [
      { specializationId: ids.get('SPA'), serviceNameId: ids.get('SB_SPA'), price: 100, duration: 60 },
      { specializationId: ids.get('SPB'), serviceNameId: ids.get('SB_SPB'), price: 200, duration: 120 },
    ],
  }
  const invalidSpecialistData = {
    name: '',
    email: '@',
    phone: 'X',
    cnpj: 'X',
    cpf: '11111111111',
    birthdate: 'X',
    services: [],
  }

  await login(secretaryCredencials, 'secretary')
  {
    await a(count()).bodyNumber(0)

    await a(create(specialistData)).then(saveId('0'))
    await a(count()).bodyNumber(1)
    await a(get(ids.get('0'))).compare(specialistData, fields, [])
    await a(listServices(ids.get('0'))).bodyLength((len) => len === 0)

    await a(create(invalidSpecialistData)).catch(acceptErrorCode(400))
    await a(count()).bodyNumber(1)

    await a(list({ page: 0, pageSize: 1 })).bodyLength((len) => len > 0)
    await a(list({ page: 1, pageSize: 1 })).bodyLength((len) => len === 0)

    await a(
      update(ids.get('0'), {
        name: specialistData.name + ' Updated',
        email: specialistData.email,
        phone: '44' + specialistData.phone.slice(2),
        cnpj: specialistData.cnpj,
        cpf: specialistData.cpf,
        birthdate: '1999-08-07',
        services: [],
      }),
    ).compare(specialistData, fields, ['name', 'phone', 'birthdate'])

    await a(get(ids.get('0'))).compare(specialistData, fields, ['name', 'phone', 'birthdate'])

    await a(remove(ids.get('0'))).statusCode(204)
    await a(count()).bodyNumber(0)
  }
  {
    console.log(chalk.yellow('Extra feature:'))
    await a(create(specialistDataWithServices)).then(saveId('1'))
    await a(count()).bodyNumber(1)
    await a(get(ids.get('1'))).compare(specialistDataWithServices, fields, [])
    await a(listServices(ids.get('1'))).bodyLength((len) => len === 2)

    await a(remove(ids.get('1'))).statusCode(204)
    await a(count()).bodyNumber(0)
  }
  {
    // side effect
    await create(specialistData).then(saveId('specialist'))
  }
  await logout()
}

async function secretary_manage_customers() {
  const { get, list, count, create, update, remove } = openService('customers')

  const saveId = (name: string) => ids.collect(name, (res) => res.data)
  const fields = ['name', 'email', 'phone', 'cpf', 'birthdate']

  const ids = new IdManager<string>()
  const customerData = {
    name: 'Customer Test',
    email: 'customer@test.com',
    cpf: '11431287962',
    birthdate: '1999-08-08',
    phone: '21987654321',
  }
  const invalidCustomerData = {
    name: '',
    email: '@',
    cpf: '11111111111',
    birthdate: '1999-08-08',
    phone: 'X',
  }

  await login(secretaryCredencials, 'secretary')
  {
    await a(count()).bodyNumber(0)

    await a(create(customerData)).then(saveId('0'))
    await a(count()).bodyNumber(1)
    await a(get(ids.get('0'))).compare(customerData, fields, [])

    await a(create(invalidCustomerData)).catch(acceptErrorCode(400))
    await a(count()).bodyNumber(1)

    await a(list({ page: 0, pageSize: 1 })).bodyLength((len) => len > 0)
    await a(list({ page: 1, pageSize: 1 })).bodyLength((len) => len === 0)

    await a(
      update(ids.get('0'), {
        name: customerData.name + ' Updated',
        email: customerData.email,
        cpf: customerData.cpf,
        birthdate: '1999-08-07',
        phone: '44' + customerData.phone.slice(2),
      }),
    ).compare(customerData, fields, ['name', 'phone', 'birthdate'])

    await a(get(ids.get('0'))).compare(customerData, fields, ['name', 'phone', 'birthdate'])

    await a(remove(ids.get('0'))).statusCode(204)
    await a(count()).bodyNumber(0)

    await a(list({ page: 0, pageSize: 1 })).bodyLength((len) => len === 0)
  }
  {
    // side effect
    await create(customerData).then(saveId('customer'))
  }
  await logout()
}

async function secretary_manage_y() {
  await login(secretaryCredencials, 'secretary')
  {
  }
  await logout()
}

async function over(callback: () => Promise<void>) {
  const stage = callback.name
  const label = chalk.blue(`End [${stage}]`)
  console.time(label)
  console.group(chalk.blue(`Start [${stage}]`))
  await callback()
  console.groupEnd()
  console.timeEnd(label)
  console.log()
}

async function main() {
  await setup()
  await over(init)
  await over(admin_manage_secretaries)
  await over(secretary_manage_specializations)
  await over(secretary_manage_service_available)
  await over(secretary_manage_service_groups)
  await over(secretary_manage_customers)
  await over(secretary_manage_specialists)
}

main()
