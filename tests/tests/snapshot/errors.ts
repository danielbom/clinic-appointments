import axios from 'axios'
import _ from 'lodash'

import { API_URL } from '../config'

import { Api, Config } from '../../src/lib/api'

import { WriteStr, WriteCombined, WriteStdout } from '../../src/lib/writable'
import { Path } from '../../src/lib/path'
import { createTracker } from '../../src/lib/tracker'
import { plugInterceptors } from './internal/plugInterceptors'
import { Args, complete } from './internal/complete'
import { baseData, credentials } from './internal/data'

const baseApi = new Api(
  new Config(
    axios.create({
      baseURL: API_URL,
      validateStatus: () => true,
    }),
  ),
)
const tracker = createTracker('api', baseApi)

function apiLogin(accessToken: string) {
  baseApi._config.instance.defaults.headers['Authorization'] = `Bearer ${accessToken}`
}

function* generateObject(obj: any) {
  const keys = Object.keys(obj)
  function* go(index: number, current: Record<string, any>): Generator<Record<string, any>> {
    if (index === keys.length) {
      yield { ...current }
      return
    }

    const key = keys[index]
    const values = obj[key]

    for (const value of values) {
      current[key] = value
      yield* go(index + 1, current)
    }
  }
  yield null
  yield {}
  yield* go(0, {})
}

const delay = (ms: number) => {
  console.log(`[${new Date().toISOString()}] Delay ${ms} ms`)
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function run(w: WriteStr, api: Api, args: Args) {
  if (!args.record) {
    if (!args.currentSnapshotPath.exists()) {
      throw new Error('snapshot does not exists. Run record first.')
    }
  }

  await api.health.healthCheck().then((res) => {
    if (!res.data.status) {
      throw new Error('API is not healthy')
    }
    if (res.data.environment !== 'test') {
      throw new Error('API is not in test environment')
    }
  })
  await api.test.stats()
  await api.test.init()

  w.write('# Route not found\n\n')
  await api.appointments.delete('')
  await api.appointments.update('', {} as any)

  w.write('# Auth errors\n\n')
  await api.auth.me()
  {
    await api.appointments.create({} as any)
    await api.appointments.getById('x')
    await api.appointments.getAll()
    await api.appointments.count()
    await api.appointments.getCalendar({} as any)
    await api.appointments.getCalendarCount({} as any)
    await api.appointments.update('x', {} as any)
    await api.appointments.delete('x')
  }
  {
    await api.customers.create({} as any)
    await api.customers.getById('x')
    await api.customers.getAll()
    await api.customers.count()
    await api.customers.update('x', {} as any)
    await api.customers.delete('x')
  }
  {
    await api.secretaries.create({} as any)
    await api.secretaries.getById('x')
    await api.secretaries.getAll()
    await api.secretaries.count()
    await api.secretaries.update('x', {} as any)
    await api.secretaries.delete('x')
  }
  {
    await api.serviceGroups.getAll()
  }
  {
    await api.services.create({} as any)
    await api.services.getById('x')
    await api.services.getAll()
    await api.services.count()
    await api.services.update('x', {} as any)
    await api.services.delete('x')
  }
  {
    await api.servicesAvailable.create({} as any)
    await api.servicesAvailable.getById('x')
    await api.servicesAvailable.getAll()
    await api.servicesAvailable.update('x', {} as any)
    await api.servicesAvailable.delete('x')
  }
  {
    await api.specialists.create({} as any)
    await api.specialists.getById('x')
    await api.specialists.getAll()
    await api.specialists.getAppointments('x')
    await api.specialists.getServices('x')
    await api.specialists.getSpecializations('x')
    await api.specialists.getService('x', 'y')
    await api.specialists.count()
    await api.specialists.update('x', {} as any)
    await api.specialists.delete('x')
  }
  {
    await api.specializations.create({} as any)
    await api.specializations.getAll()
    await api.specializations.update('x', {} as any)
    await api.specializations.delete('x')
  }

  w.write('# api.auth.login: Short expiration time\n\n')
  await api.auth
    .login(credentials.admin, {
      headers: {
        'x-access-token-expires-in': 1,
        'x-refresh-token-expires-in': 1,
      },
    })
    .then((res) => {
      state.shortAuth.time = Date.now()
      state.shortAuth.accessToken = res.data.accessToken
      state.shortAuth.refreshToken = res.data.refreshToken
    })

  w.write('# api.auth.login: Invalid body\n\n')
  for (const data of generateObject({ email: [null, ''], password: [null, ''] })) {
    await api.auth.login(data as any)
  }

  await api.auth.login({ email: credentials.admin.email, password: 'invalid-password' })

  await api.auth.me()

  w.write('# api.auth.login: Long expiration time\n\n')
  await api.auth.login(credentials.admin).then((res) => {
    apiLogin(res.data.accessToken)
    state.longAuth.accessToken = res.data.accessToken
    state.longAuth.refreshToken = res.data.refreshToken
  })

  w.write('# api.auth.refresh: Long accessToken auth\n\n')
  await api.auth.refresh(state.longAuth.accessToken)

  w.write('# Invalid uuid when calling any .getById(id)\n\n')
  await api.appointments.getById('0')
  await api.customers.getById('0')
  await api.secretaries.getById('0')
  await api.services.getById('0')
  await api.servicesAvailable.getById('0')
  await api.specialists.getById('0')

  w.write('# api.secretaries.create\n\n')
  for (const data of generateObject({
    name: [null, baseData.secretary.name],
    cnpj: [baseData.secretary.cnpj],
    cpf: [baseData.secretary.cpf],
    phone: [baseData.secretary.phone],
    email: [baseData.secretary.email],
    password: [baseData.secretary.password],
    birthdate: [baseData.secretary.birthdate],
  })) {
    await api.secretaries.create(data as any).then((res) => {
      if (res.data.id) {
        state.secretaryId = res.data.id
      }
    })
  }

  w.write('# api.specializations.create\n\n')
  for (const data of generateObject({ name: [] })) {
    await api.specializations.create(data as any)
  }

  await api.specializations.create({ name: 'Specialization' }).then((res) => (state.specializationId = res.data.id))

  w.write('# api.servicesAvailable.create\n\n')
  for (const data of generateObject({
    name: [null, '', 'Service Available'],
    specializationId: [''],
  })) {
    await api.servicesAvailable.create(data as any)
  }

  for (const data of generateObject({
    name: [''],
    specializationId: [null, '', state.specializationId],
  })) {
    await api.servicesAvailable.create(data as any)
  }

  await api.servicesAvailable
    .create({ name: 'Service Available', specializationId: state.specializationId })
    .then((res) => (state.serviceAvailableId = res.data.id))

  w.write('# api.specialists.create\n\n')
  await api.specialists.create(baseData.specialist).then((res) => (state.specialistId = res.data.id))

  w.write('# api.services.create\n\n')
  await api.services
    .create({ serviceNameId: state.serviceAvailableId, specialistId: state.specialistId, duration: 60, price: 10000 })
    .then((res) => (state.serviceId = res.data.id))

  w.write('# api.customer.create\n\n')
  await api.customers.create(baseData.customer).then((res) => (state.customerId = res.data.id))

  w.write('# api.appointments.create\n\n')
  await api.appointments
    .create({ customerId: state.customerId, serviceId: state.serviceId, date: '2032-01-02', time: '09:00:00' })
    .then((res) => (state.appointmentId = res.data.id))

  // not found
  await api.appointments.getById(state.serviceAvailableId)
  await api.customers.getById(state.serviceAvailableId)
  await api.secretaries.getById(state.serviceAvailableId)
  await api.services.getById(state.serviceAvailableId)
  await api.servicesAvailable.getById(state.secretaryId)
  await api.specialists.getById(state.serviceAvailableId)

  // invalid access
  w.write('# Invalid access\n\n')
  await api.secretaries
    .create({
      ...baseData.secretary,
      email: 'secretary2@test.com',
    })
    .then((res) => {
      state.secretaryId2 = res.data.id
    })

  await api.auth.login(credentials.secretary).then((res) => apiLogin(res.data.accessToken))

  await api.secretaries.getAll()
  await api.secretaries.count()
  await api.secretaries.getById(state.secretaryId2)
  await api.secretaries.create(baseData.secretary)
  await api.secretaries.update(state.secretaryId2, {} as any)
  await api.secretaries.delete(state.secretaryId)

  // conflict
  apiLogin(state.longAuth.accessToken)
  await api.secretaries.create(baseData.secretary)
  await api.specializations.create({ name: 'Specialization' })
  await api.servicesAvailable.create({ name: 'Service', specializationId: state.specializationId })
  await api.specialists.create(baseData.specialist)
  await api.services.create({
    serviceNameId: state.serviceAvailableId,
    specialistId: state.specialistId,
    duration: 60,
    price: 10000,
  })
  await api.customers.create(baseData.customer)
  await api.appointments.create({
    customerId: state.customerId,
    serviceId: state.serviceId,
    date: '2032-01-02',
    time: '09:00:00',
  })
  await api.appointments.create({
    customerId: state.customerId,
    serviceId: state.serviceId,
    date: '2032-01-02',
    time: '09:30:00',
  })
  await api.appointments.create({
    customerId: state.customerId,
    serviceId: state.serviceId,
    date: '2032-01-02',
    time: '09:59:00',
  })
  await api.appointments.create({
    customerId: state.customerId,
    serviceId: state.serviceId,
    date: '2032-01-02',
    time: '10:00:00',
  })

  // validate formats
  w.write('# api.secretaries.create\n\n')
  {
    const values: Record<string, any[]> = {
      cnpj: ['12345678910123'],
      cpf: ['12345678910'],
      phone: ['4678x9012'],
      email: ['xxx'],
    }
    for (const key in values) {
      for (const value of values[key]) {
        await api.secretaries.create({ ...baseData.secretary, [key]: value })
      }
    }
  }

  // token expired
  w.write('# Token expired\n\n')
  {
    await delay(Math.max(Date.now() - state.shortAuth.time + 10, 0))
    apiLogin(state.shortAuth.accessToken)
    await api.auth.me()
    await api.auth.refresh(state.shortAuth.accessToken)
    await api.auth.refresh(state.shortAuth.refreshToken)
  }

  complete(w.value(), args)
}

const state = {
  longAuth: {
    accessToken: '',
    refreshToken: '',
  },
  shortAuth: {
    accessToken: '',
    refreshToken: '',
    time: 0,
  },
  specializationId: '',
  serviceAvailableId: '',
  secretaryId: '',
  secretaryId2: '',
  specialistId: '',
  customerId: '',
  serviceId: '',
  appointmentId: '',
}

function main() {
  const SNAPSHOTS_DIR = Path.from(import.meta.dirname).append('snapshots')
  const SNAPSHOT_LOG_PATH = SNAPSHOTS_DIR.append('errors.log')
  const ACTUAL_SNAPSHOT_PATH = SNAPSHOTS_DIR.append('errors.actual.txt')
  const CURRENT_SNAPSHOT_PATH = SNAPSHOTS_DIR.append('errors.txt')

  SNAPSHOTS_DIR.mkdir({ existsOk: true })
  const snapshotLog = SNAPSHOT_LOG_PATH.open('w')
  const logger = new WriteCombined([snapshotLog, new WriteStdout()])

  const w = new WriteStr()

  plugInterceptors('errors.ts', baseApi._config.instance, {
    writter: w,
    logger,
  })

  const startAt = new Date()
  const timeMessage = `[${startAt.toISOString()}]`
  console.log(timeMessage + ' Start')
  console.time(timeMessage + ' Time')

  run(w, tracker.proxy, {
    record: process.argv[2] === 'record',
    currentSnapshotPath: CURRENT_SNAPSHOT_PATH,
    actualSnapshotPath: ACTUAL_SNAPSHOT_PATH,
  })
    .catch((error) => {
      ACTUAL_SNAPSHOT_PATH.writeText(w.value())
      throw error
    })
    .finally(() => {
      console.log(timeMessage + ` End errors snapshot: ${API_URL}`)
      console.timeEnd(timeMessage + ' Time')
      snapshotLog.close()
    })
}

main()
