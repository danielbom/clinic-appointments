import axios, { AxiosResponse } from 'axios'
import _ from 'lodash'
import { addDays, addHours, addMinutes, endOfYear, startOfYear } from 'date-fns'

import { BASE_URL } from '../config'

import { Api, Config } from '../../src/lib/api'
import { getDatePart, getHourPart } from '../../src/lib/date-fns-ext'

import { Writable, WriteStr, WriteCombined } from '../../src/lib/writable'
import { Path } from '../../src/lib/path'
import { createTracker } from '../../src/lib/tracker'
import levenshtein from "fast-levenshtein";

export function getSimilarity(a: string, b: string): number {
  const distance = levenshtein.get(a, b);
  const maxLength = Math.max(a.length, b.length);

  if (maxLength === 0) return 100;

  return (1 - distance / maxLength) * 100;
}

const baseApi = new Api(
  new Config(
    axios.create({
      baseURL: BASE_URL,
      validateStatus: (status) => status < 500,
    }),
  ),
)
const tracker = createTracker('api', baseApi)
const api = tracker.proxy

function writeResponse(writer: Writable, response: AxiosResponse) {
  // https://github.com/horprogs/react-query/blob/7e69a716054958721288d34a26b30427c257aa3b/src/utils/mockApi.ts#L37
  if (!response) return
  const method = response.config.method?.toUpperCase() || 'UNKNOWN'
  const url = response.config.url
  if (!url) return
  const status = response.status
  writer.write(`Request: ${method} ${url} ${status}\n`)
  if (response.config.params != null) {
    writer.write(`Params: ${JSON.stringify(response.config.params, null, 2)}\n`)
  }
  if (response.config.data != null) {
    writer.write(`Body: ${JSON.stringify(response.config.data, null, 2)}\n`)
  }
  if (response.data != null) {
    writer.write(`Response: ${JSON.stringify(response.data, null, 2)}\n`)
  }
  writer.write('\n')
}

const ids = {
  items: {} as Record<string, number>,
  current: 1,
  get(id: string) {
    ids.items[id] = ids.items[id] || this.current++
    return ids.items[id]
  },
}

const UUID_REGEX = /\/(\w\w\w\w\w\w\w\w-\w\w\w\w-\w\w\w\w-\w\w\w\w-\w\w\w\w\w\w\w\w\w\w\w\w)/g

function redactResponse(response: AxiosResponse | undefined): any {
  function redactData(data: any): any {
    if (typeof data !== 'object') return data
    if (!data) return data
    if (Array.isArray(data)) return data.map(redactData)
    const newData = { ...data }
    if (newData.accessToken) newData.accessToken = ids.get(newData.accessToken)
    if (newData.refreshToken) newData.refreshToken = ids.get(newData.refreshToken)
    if (newData.createdAt) newData.createdAt = '[temporal]'
    if (newData.updatedAt) newData.updatedAt = '[temporal]'
    if (newData.id) newData.id = ids.get(newData.id)
    for (const key in newData) {
      if (key.endsWith('Id')) {
        newData[key] = ids.get(newData[key])
      } else {
        newData[key] = redactData(newData[key])
      }
    }
    return newData
  }
  if (!response || typeof response != 'object') return response
  const { data, config, ...responseRest } = response
  const newResponse: any = { ...responseRest }
  newResponse.config = { ...config, url: config.url ?? '' }
  newResponse.data = redactData(data)
  if (config.data) {
    newResponse.config.data = redactData(JSON.parse(config.data))
  }
  for (const match of newResponse.config.url.matchAll(UUID_REGEX)) {
    newResponse.config.url = newResponse.config.url.replace(match[1], ids.get(match[1]).toString())
  }
  return newResponse
}

const ACTUAL_SNAPSHOT_PATH = Path.from(import.meta.dirname).append('snapshot.actual.txt')
const CURRENT_SNAPSHOT_PATH = Path.from(import.meta.dirname).append('snapshot.txt')

const output = new WriteStr()
const w = new WriteCombined([
  // new WriteStdout(),
  output,
])

class SimpleAxiosError extends Error {
  public code = ''
  public status = 0
  public config = {} as any
  public response = {
    data: undefined,
  }
  public constructor(error: any) {
    super(String(error))
    if (error) {
      this.code = error.code
      this.status = error.status
      this.response.data = error.response?.data
      for (const key of ['method', 'baseURL', 'headers', 'url', 'data']) {
        this.config[key] = error.config?.[key]
      }
    }
    Error.captureStackTrace(this)
  }
}

api._config.instance.interceptors.response.use(
  (response) => {
    writeResponse(w, redactResponse(response))
    return response
  },
  (error) => {
    writeResponse(w, redactResponse(error.response))
    throw new SimpleAxiosError(error)
  },
)

function apiLogin(accessToken: string) {
  api._config.instance.defaults.headers['Authorization'] = `Bearer ${accessToken}`
}

interface Args {
  record: boolean
}

function complete(args: Args) {
  const actual = output.toString()

  if (args.record) {
    CURRENT_SNAPSHOT_PATH.writeText(actual)
    return
  }

  const expected = CURRENT_SNAPSHOT_PATH.readText()

  if (actual === expected) {
    console.log('INFO: OK')
    if (ACTUAL_SNAPSHOT_PATH.exists()) {
      ACTUAL_SNAPSHOT_PATH.unlink()
    }
    return
  }

  ACTUAL_SNAPSHOT_PATH.writeText(actual)
  console.log(`ERROR: Snapshot mismatch: ${getSimilarity(actual, expected).toFixed(2)}%`)
}

async function run(args: Args) {
  if (!args.record) {
    if (!CURRENT_SNAPSHOT_PATH.exists()) {
      throw new Error('snapshot does not exists. Run record first.')
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
  const secretaryData = {
    name: 'Secretary Test',
    ...secretaryCredencials,
    birthdate: '2000-10-10',
    cnpj: '08130896000135',
    cpf: '72730805001',
    phone: '119876543210',
  }
  const specialistData = {
    name: 'Specialist Test',
    email: 'specialist@test.com',
    phone: '219876543210',
    cnpj: '16833374000128',
    cpf: '96156338012',
    birthdate: '1999-09-09',
    services: [],
  }
  const customerData = {
    name: 'Customer Test',
    email: 'customer@test.com',
    cpf: '11431287962',
    birthdate: '1999-08-08',
    phone: '21987654321',
  }

  const createDate = new Date(2030, 0, 2)
  const createDateIso = createDate.toISOString()
  const updateDate = addHours(addDays(createDate, 2), 1)
  const updateDateIso = updateDate.toISOString()

  const state = {
    refreshToken: '',
    secretaryId: '',
    specializationIdA: '',
    specializationIdB: '',
    servicesAvailableIds: [] as string[],
    specialistId: '',
    serviceId: '',
    customerId: '',
    appointmentId: '',
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

  await api.auth.login(adminCredentials).then((res) => {
    apiLogin(res.data.accessToken)
    state.refreshToken = res.data.refreshToken
  })
  await api.auth.me()
  // await api.auth.refresh(state.refreshToken) // TODO: FIX golang refresh logic

  // secretaries
  await api.secretaries.count()
  await api.secretaries.getAll()
  await api.secretaries.create(secretaryData).then((res) => (state.secretaryId = res.data.id))
  await api.secretaries.create(secretaryData)
  await api.secretaries.count()
  await api.secretaries.getAll()
  await api.secretaries.getById(state.secretaryId)
  await api.secretaries.update(state.secretaryId, {
    name: secretaryData.name + ' Updated',
    email: secretaryData.email,
    password: undefined, // no update
    phone: '44' + secretaryData.phone.slice(2),
    cpf: secretaryData.cpf,
    cnpj: secretaryData.cnpj,
    birthdate: secretaryData.birthdate,
  })
  await api.secretaries.getById(state.secretaryId)
  await api.secretaries.delete(state.secretaryId)
  await api.secretaries.getById(state.secretaryId)
  await api.secretaries.count()
  await api.secretaries.getAll()
  await api.secretaries.create(secretaryData).then((res) => (state.secretaryId = res.data.id))

  await api.auth.login(secretaryCredencials).then((res) => apiLogin(res.data.accessToken))
  await api.auth.me()

  // specializations
  await api.specializations.getAll()
  await api.specializations.create({ name: 'Specialization A' }).then((res) => (state.specializationIdA = res.data.id))
  await api.specializations.create({ name: 'Specialization B' }).then((res) => (state.specializationIdB = res.data.id))
  await api.specializations.create({ name: 'Specialization A' })
  await api.specializations.create({ name: '' })
  await api.specializations.getAll()
  await api.specializations.update(state.specializationIdA, { name: 'Specialization A Updated' })
  await api.specializations.getAll()
  await api.specializations.delete(state.specializationIdA)
  await api.specializations.delete(state.specializationIdB)
  await api.specializations.getAll()
  await api.specializations.create({ name: 'Specialization A' }).then((res) => (state.specializationIdA = res.data.id))
  await api.specializations.create({ name: 'Specialization B' }).then((res) => (state.specializationIdB = res.data.id))

  // servicesAvailable
  await api.servicesAvailable.getAll()
  for (const suffix of ['A', 'B']) {
    const res = await api.servicesAvailable.create({
      name: `Service Available ${suffix}`,
      specializationId: state.specializationIdA,
    })
    state.servicesAvailableIds.push(res.data.id)
  }
  for (const suffix of ['1', '2']) {
    const res = await api.servicesAvailable.create({
      name: `Service Available ${suffix}`,
      specializationId: state.specializationIdB,
    })
    state.servicesAvailableIds.push(res.data.id)
  }
  await api.servicesAvailable.getAll()
  for (const servicesAvailableId of state.servicesAvailableIds) {
    await api.servicesAvailable.getById(servicesAvailableId)
  }
  await api.servicesAvailable.update(state.servicesAvailableIds[0], {
    name: 'Updated',
  })
  await api.servicesAvailable.getAll()
  await api.servicesAvailable.getById(state.servicesAvailableIds[0])
  for (const servicesAvailableId of state.servicesAvailableIds) {
    await api.servicesAvailable.delete(servicesAvailableId)
  }
  state.servicesAvailableIds.length = 0
  await api.servicesAvailable.getAll()

  for (const suffix of ['A', 'B']) {
    const res = await api.servicesAvailable.create({
      name: `Service Available ${suffix}`,
      specializationId: state.specializationIdA,
    })
    state.servicesAvailableIds.push(res.data.id)
  }
  for (const suffix of ['1', '2']) {
    const res = await api.servicesAvailable.create({
      name: `Service Available ${suffix}`,
      specializationId: state.specializationIdB,
    })
    state.servicesAvailableIds.push(res.data.id)
  }
  await api.servicesAvailable.getAll()

  // specialists
  await api.specialists.getAll()
  await api.specialists.count()
  await api.specialists.create(specialistData).then((res) => (state.specialistId = res.data.id))
  await api.specialists.getServices(state.specialistId)
  await api.specialists.getSpecializations(state.specialistId)
  await api.specialists.getAll()
  await api.specialists.count()
  await api.specialists.getById(state.specialistId)
  await api.specialists.update(state.specialistId, {
    name: specialistData.name + ' Updated',
    email: specialistData.email,
    phone: '44' + specialistData.phone.slice(2),
    cnpj: specialistData.cnpj,
    cpf: specialistData.cpf,
    birthdate: '1999-08-07',
    services: [],
  })
  await api.specialists.getById(state.specialistId)
  await api.specialists.getAll()
  await api.specialists.delete(state.specialistId)
  await api.specialists.getAll()
  await api.specialists.count()
  await api.specialists
    .create({
      ...specialistData,
      services: [
        { serviceNameId: state.servicesAvailableIds[0], price: 100, duration: 60 },
        { serviceNameId: state.servicesAvailableIds[2], price: 200, duration: 120 },
      ],
    })
    .then((res) => (state.specialistId = res.data.id))
  await api.specialists.getById(state.specialistId)
  await api.specialists.getServices(state.specialistId)
  await api.specialists.getSpecializations(state.specialistId)
  await api.specialists.delete(state.specialistId)

  await api.specialists
    .create({
      ...specialistData,
      services: [
        { serviceNameId: state.servicesAvailableIds[0], price: 100, duration: 60 },
        { serviceNameId: state.servicesAvailableIds[1], price: 200, duration: 120 },
      ],
    })
    .then((res) => (state.specialistId = res.data.id))

  // services
  await api.services.getAll()
  await api.services.count()
  await api.services
    .create({
      duration: 60,
      price: 1000,
      serviceNameId: state.servicesAvailableIds[3],
      specialistId: state.specialistId,
    })
    .then((res) => (state.serviceId = res.data.id))
  await api.services.getAll()
  await api.services.count()
  await api.services.getById(state.serviceId)
  await api.services.update(state.serviceId, {
    duration: 30,
    price: 500,
    serviceNameId: state.servicesAvailableIds[2],
  })
  await api.services.getById(state.serviceId)
  await api.services.getAll()
  await api.services.delete(state.serviceId)
  await api.services.getAll()
  await api.services.count()

  await api.services
    .create({
      duration: 60,
      price: 1000,
      serviceNameId: state.servicesAvailableIds[3],
      specialistId: state.specialistId,
    })
    .then((res) => (state.serviceId = res.data.id))

  // customer
  await api.customers.getAll()
  await api.customers.count()
  await api.customers.create(customerData).then((res) => (state.customerId = res.data.id))
  await api.customers.getById(state.customerId)
  await api.customers.getAll()
  await api.customers.count()
  await api.customers.update(state.customerId, {
    name: customerData.name + ' Updated',
    email: customerData.email,
    phone: '44' + customerData.phone.slice(2),
    cpf: customerData.cpf,
    birthdate: '1999-08-07',
  })
  await api.customers.getById(state.customerId)
  await api.customers.getAll()
  await api.customers.count()
  await api.customers.delete(state.customerId)
  await api.customers.getAll()
  await api.customers.count()

  await api.customers.create(customerData).then((res) => (state.customerId = res.data.id))

  // appointments
  await api.appointments.getAll({})
  await api.appointments.count()
  await api.appointments
    .create({
      date: getDatePart(createDateIso),
      time: getHourPart(createDateIso),
      customerId: state.customerId,
      serviceId: state.serviceId,
    })
    .then((res) => (state.appointmentId = res.data.id))
  await api.appointments.getAll()
  await api.appointments.count()
  await api.appointments.getCalendarCount({
    startDate: getDatePart(startOfYear(createDate).toISOString()),
    endDate: getDatePart(endOfYear(createDate).toISOString()),
  })
  await api.appointments.getCalendar({
    startDate: getDatePart(startOfYear(createDate).toISOString()),
    endDate: getDatePart(endOfYear(createDate).toISOString()),
  })
  await api.appointments.getById(state.appointmentId)
  await api.appointments.update(state.appointmentId, {
    date: getDatePart(updateDateIso),
    time: getHourPart(updateDateIso),
    status: 2,
  })
  await api.appointments.getById(state.appointmentId)
  await api.appointments.getAll()
  await api.appointments.delete(state.appointmentId)
  await api.appointments.getAll()
  await api.appointments.count()

  await api.appointments
    .create({
      date: getDatePart(createDateIso),
      time: getHourPart(createDateIso),
      customerId: state.customerId,
      serviceId: state.serviceId,
    })
    .then((res) => (state.appointmentId = res.data.id))

  // extras
  await api.specialists.getAppointments(state.specialistId)

  await api.serviceGroups.getAll()

  await api.specialists.getServices(state.specialistId)
  await api.specialists.getService(state.specialistId, state.servicesAvailableIds[3])

  w.write('Report: \n')
  w.write(JSON.stringify(tracker.report(), null, 2))
  w.write('\n')
  complete(args)
}

run({ record: process.argv[2] === 'record' }).catch((error) => {
  ACTUAL_SNAPSHOT_PATH.writeText(output.toString())
  throw error
})
