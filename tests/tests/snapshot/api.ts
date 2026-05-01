import axios from 'axios'
import _ from 'lodash'
import { addDays, addHours, endOfYear, startOfYear } from 'date-fns'

import { API_URL } from '../config'

import { Api, AppointmentStatus, Config } from '../../src/lib/api'
import { getDatePart, getHourPart } from '../../src/lib/date-fns-ext'

import { WriteStr, WriteCombined, WriteStdout } from '../../src/lib/writable'
import { Path } from '../../src/lib/path'
import { createTracker } from '../../src/lib/tracker'
import { Random, rng } from '../../src/lib/rng'
import { generateDatesFrom } from './internal/generateDatesFrom'
import { enableWriteResponse, plugInterceptors } from './internal/plugInterceptors'
import { Args, complete } from './internal/complete'
import { baseData, credentials } from './internal/data'

const random = new Random(rng.mulberry32(12345))

const baseApi = new Api(
  new Config(
    axios.create({
      baseURL: API_URL,
      validateStatus: (status) => status < 500,
    }),
  ),
)
const tracker = createTracker('api', baseApi)

function apiLogin(accessToken: string) {
  baseApi._config.instance.defaults.headers['Authorization'] = `Bearer ${accessToken}`
}

async function run(w: WriteStr, api: Api, args: Args) {
  if (!args.record) {
    if (!args.currentSnapshotPath.exists()) {
      throw new Error('snapshot does not exists. Run record first.')
    }
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
    secretaryIds: [] as string[],
    specializationIds: [] as string[],
    specialistIds: [] as string[],
    customerIds: [] as string[],
    specialistServiceIds: {} as Record<string, { serviceId: string; serviceNameId: string }[]>,
    serviceIds: [] as string[],
    appointmentIds: [] as string[],
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

  await api.auth.login(credentials.admin).then((res) => {
    apiLogin(res.data.accessToken)
    state.refreshToken = res.data.refreshToken
  })
  await api.auth.me()
  // await api.auth.refresh(state.refreshToken) // TODO: FIX golang refresh logic

  // secretaries
  await api.secretaries.count()
  await api.secretaries.getAll()
  await api.secretaries.create(baseData.secretary).then((res) => (state.secretaryId = res.data.id))
  await api.secretaries.create(baseData.secretary)
  await api.secretaries.count()
  await api.secretaries.getAll()
  await api.secretaries.getById(state.secretaryId)
  await api.secretaries.update(state.secretaryId, {
    name: baseData.secretary.name + ' Updated',
    email: baseData.secretary.email,
    password: undefined, // no update
    phone: '44' + baseData.secretary.phone.slice(2),
    cpf: baseData.secretary.cpf,
    cnpj: baseData.secretary.cnpj,
    birthdate: baseData.secretary.birthdate,
  })
  await api.secretaries.getById(state.secretaryId)
  await api.secretaries.delete(state.secretaryId)
  await api.secretaries.getById(state.secretaryId)
  await api.secretaries.count()
  await api.secretaries.getAll()
  await api.secretaries.create(baseData.secretary).then((res) => (state.secretaryId = res.data.id))

  await api.auth.login(credentials.secretary).then((res) => apiLogin(res.data.accessToken))
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
  await api.servicesAvailable.getById(state.servicesAvailableIds[0])
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
  await api.specialists.create(baseData.specialist).then((res) => (state.specialistId = res.data.id))
  await api.specialists.getServices(state.specialistId)
  await api.specialists.getSpecializations(state.specialistId)
  await api.specialists.getAll()
  await api.specialists.count()
  await api.specialists.getById(state.specialistId)
  await api.specialists.update(state.specialistId, {
    name: baseData.specialist.name + ' Updated',
    email: baseData.specialist.email,
    phone: '44' + baseData.specialist.phone.slice(2),
    cnpj: baseData.specialist.cnpj,
    cpf: baseData.specialist.cpf,
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
      ...baseData.specialist,
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
      ...baseData.specialist,
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
  await api.services.getById(state.serviceId)
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
  await api.customers.create(baseData.customer).then((res) => (state.customerId = res.data.id))
  await api.customers.getById(state.customerId)
  await api.customers.getAll()
  await api.customers.count()
  await api.customers.update(state.customerId, {
    name: baseData.customer.name + ' Updated',
    email: baseData.customer.email,
    phone: '44' + baseData.customer.phone.slice(2),
    cpf: baseData.customer.cpf,
    birthdate: '1999-08-07',
  })
  await api.customers.getById(state.customerId)
  await api.customers.getAll()
  await api.customers.count()
  await api.customers.delete(state.customerId)
  await api.customers.getById(state.customerId)
  await api.customers.getAll()
  await api.customers.count()

  await api.customers.create(baseData.customer).then((res) => (state.customerId = res.data.id))

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
  await api.appointments.getById(state.appointmentId)
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
  w.write('\n')

  // Seed
  {
    enableWriteResponse(false)

    await api.test.init()
    state.servicesAvailableIds.length = 0

    await api.auth.login(credentials.admin).then((res) => apiLogin(res.data.accessToken))

    // [secretaries]
    for (let i = 0; i < 20; i++) {
      const res = await api.secretaries.create({
        name: `Secretary ${i.toString().padStart(4, '0')}`,
        email: `secretary-${i}@test.com`,
        password: '123@mudaR',
        birthdate: random.date(1980, 2010),
        cnpj: '08130896000135',
        cpf: '72730805001',
        phone: '119876543210',
      })
      if (res.status !== 201) throw new Error(`secretaries ${i}: ${JSON.stringify(res.data)}`)
      state.secretaryIds.push(res.data.id)
    }

    // [specializations]
    for (let i = 0; i < 10; i++) {
      const res = await api.specializations.create({
        name: `Specialization ${i.toString().padStart(4, '0')}`,
      })
      if (res.status !== 201) throw new Error(`specializations ${i}: ${JSON.stringify(res.data)}`)
      state.specializationIds.push(res.data.id)
    }

    // [servicesAvailable]
    for (let ix = 0; ix < state.specializationIds.length; ix++) {
      const specializationId = state.specializationIds[ix]
      for (let i = 0; i < 5; i++) {
        const res = await api.servicesAvailable.create({
          name: `Service Available ${ix}-${i.toString().padStart(4, '0')}`,
          specializationId: specializationId,
        })
        if (res.status !== 201) throw new Error(`servicesAvailable ${i}: ${JSON.stringify(res.data)}`)
        state.servicesAvailableIds.push(res.data.id)
      }
    }

    // [specialists]
    for (let i = 0; i < 50; i++) {
      const res = await api.specialists.create({
        name: `Specialist ${i.toString().padStart(4, '0')}`,
        email: `specialist-${i}@test.com`,
        phone: '219876543210',
        cnpj: '16833374000128',
        cpf: '96156338012',
        birthdate: random.date(1980, 2000),
        services: [],
      })
      if (res.status !== 201) throw new Error(`specialists ${i}: ${JSON.stringify(res.data)}`)
      state.specialistIds.push(res.data.id)
    }

    // [services]
    for (let ix = 0; ix < state.specialistIds.length; ix++) {
      const specialistId = state.specialistIds[ix]

      const serviceNameIds = _.uniq(random.choices(random.integer(1, 5), state.servicesAvailableIds))
      for (let i = 0; i < serviceNameIds.length; i++) {
        const serviceNameId = serviceNameIds[i]
        const res = await api.services.create({
          duration: random.range(30, 90, 15),
          price: random.range(25, 250, 25),
          serviceNameId,
          specialistId,
        })
        if (res.status !== 201) throw new Error(`services ${ix}: i: ${JSON.stringify(res.data)}`)
        state.specialistServiceIds[specialistId] = state.specialistServiceIds[specialistId] || []
        state.specialistServiceIds[specialistId].push({ serviceNameId, serviceId: res.data.id })
        state.serviceIds.push(res.data.id)
      }
    }

    // [customers]
    for (let i = 0; i < 150; i++) {
      const res = await api.customers.create({
        name: `Customer ${i.toString().padStart(4, '0')}`,
        email: `customer-${i}@test.com`,
        cpf: '11431287962',
        birthdate: random.date(1960, 2010),
        phone: `21987654${i.toString().padStart(3, '0')}`,
      })
      if (res.status !== 201) throw new Error(`customers ${i}: ${JSON.stringify(res.data)}`)
      state.customerIds.push(res.data.id)
    }

    // appointments
    const frequencyRanges: [number, number][] = [
      [0, 0],
      [5, 6],
      [5, 6],
      [4, 5],
      [3, 4],
      [4, 5],
      [0, 0],
    ]
    const specialistIds = Object.keys(state.specialistServiceIds)
    await generateDatesFrom({
      startAt: new Date(2031, 0, 2),
      endAt: new Date(2031, 11, 30),
      async consume(date) {
        const [min, max] = frequencyRanges[date.getDay()]
        random.shuffle(specialistIds)

        const count = Math.min(random.integer(min, max), specialistIds.length)

        for (let ix = 0; ix < count; ix++) {
          const res = await api.appointments.create({
            date: getDatePart(date.toISOString()),
            time: `${(9 + ix).toString().padStart(2, '0')}:00:00`,
            customerId: random.choice(state.customerIds),
            serviceId: random.choice(state.specialistServiceIds[specialistIds[ix]]).serviceId,
          })
          if (res.status !== 201) throw new Error(`appointments ${ix}: ${JSON.stringify(res.data)}`)
          state.appointmentIds.push(res.data.id)
        }
      },
    })
    enableWriteResponse(true)
  }

  // await api.services.getAll({ page: 1, pageSize: 5, specialist: '' })

  await api.customers.getAll({ page: 0, pageSize: 5, name: 'CustomerX' })
  await api.customers.getAll({ page: 0, pageSize: 5, name: '1' })
  await api.customers.getAll({ page: 1, pageSize: 5, name: '1' })
  await api.customers.getAll({ phone: '21987654002' })
  await api.customers.getAll({ page: 0, pageSize: 5, cpf: '11431287962' })

  await api.customers.count({ name: 'CustomerX' })
  await api.customers.count({ name: '1' })
  await api.customers.count({ phone: '21987654002' })
  await api.customers.count({ cpf: '11431287962' })

  await api.secretaries.getAll({ page: 0, pageSize: 5, name: 'SecretaryX' })
  await api.secretaries.getAll({ page: 0, pageSize: 5, name: '1' })
  await api.secretaries.getAll({ page: 1, pageSize: 5, name: '1' })
  await api.secretaries.getAll({ page: 0, pageSize: 5, phone: '119876543210' })
  await api.secretaries.getAll({ page: 0, pageSize: 5, cpf: '72730805001' })
  await api.secretaries.getAll({ page: 0, pageSize: 5, cnpj: '08130896000135' })

  await api.secretaries.count({ name: 'SecretaryX' })
  await api.secretaries.count({ name: '1' })
  await api.secretaries.count({ phone: '119876543210' })
  await api.secretaries.count({ cpf: '72730805001' })
  await api.secretaries.count({ cnpj: '08130896000135' })

  await api.specialists.getAll({ page: 0, pageSize: 5, name: 'SpecialistX' })
  await api.specialists.getAll({ page: 0, pageSize: 5, name: '1' })
  await api.specialists.getAll({ page: 1, pageSize: 5, name: '1' })
  await api.specialists.getAll({ page: 0, pageSize: 5, phone: '219876543210' })
  await api.specialists.getAll({ page: 0, pageSize: 5, cpf: '96156338012' })
  await api.specialists.getAll({ page: 0, pageSize: 5, cnpj: '16833374000128' })

  await api.specialists.count({ name: 'SpecialistX' })
  await api.specialists.count({ name: '1' })
  await api.specialists.count({ phone: '219876543210' })
  await api.specialists.count({ cpf: '96156338012' })
  await api.specialists.count({ cnpj: '16833374000128' })

  await api.services.getAll({ page: 0, pageSize: 5, service: '1' })
  await api.services.getAll({ page: 1, pageSize: 5, service: '1' })
  await api.services.getAll({ page: 0, pageSize: 5, specialist: '10' })
  await api.services.getAll({ page: 0, pageSize: 5, specialization: '0' })

  await api.services.count({ service: '1' })
  await api.services.count({ specialist: '10' })
  await api.services.count({ specialization: '0' })

  await api.appointments.getAll({ page: 0, pageSize: 5, customer: '100' })
  await api.appointments.getAll({ page: 1, pageSize: 5, customer: '100' })
  await api.appointments.getAll({ page: 0, pageSize: 5, startDate: '2031-06-01', endDate: '2031-06-31' })
  await api.appointments.getAll({ page: 0, pageSize: 5, specialist: '10' })
  await api.appointments.getAll({ page: 0, pageSize: 5, serviceName: '10' })
  await api.appointments.getAll({ page: 0, pageSize: 5, status: AppointmentStatus.Pending })

  await api.servicesAvailable.getAll()

  await api.specializations.getAll()

  await api.appointments.getCalendar({ startDate: '2031-01-01', endDate: '2031-12-31' })
  await api.appointments.getCalendarCount({ startDate: '2031-01-01', endDate: '2031-12-31' })

  // TODO: limit startDate and endDate range
  // await api.appointments.getCalendar({ startDate: '2031-01-01', endDate: '2031-01-31' })
  // await api.appointments.getCalendarCount({ startDate: '2031-01-01', endDate: '2031-01-31' })

  complete(w.value(), args)
}

function main() {
  const SNAPSHOTS_DIR = Path.from(import.meta.dirname).append('snapshots')
  const SNAPSHOT_LOG_PATH = SNAPSHOTS_DIR.append('api.log')
  const ACTUAL_SNAPSHOT_PATH = SNAPSHOTS_DIR.append('api.actual.txt')
  const CURRENT_SNAPSHOT_PATH = SNAPSHOTS_DIR.append('api.txt')

  SNAPSHOTS_DIR.mkdir({ existsOk: true })
  const snapshotLog = SNAPSHOT_LOG_PATH.open('w')
  const logger = new WriteCombined([snapshotLog, new WriteStdout()])

  const w = new WriteStr()

  plugInterceptors('api.ts', baseApi._config.instance, {
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
      console.log(timeMessage + ` End api snapshot: ${API_URL}`)
      console.timeEnd(timeMessage + ' Time')
      snapshotLog.close()
    })
}

main()
