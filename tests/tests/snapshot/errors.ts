import axios from 'axios'
import _ from 'lodash'
import { addDays, addHours, endOfYear, startOfYear } from 'date-fns'

import { API_URL } from '../config'

import { Api, AppointmentStatus, Config } from '../../src/lib/api'
import { getDatePart, getHourPart } from '../../src/lib/date-fns-ext'

import { WriteStr, WriteCombined, WriteStdout, Writable } from '../../src/lib/writable'
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

async function run(w: WriteStr, api: Api, args: Args) {
  if (!args.record) {
    if (!args.currentSnapshotPath.exists()) {
      throw new Error('snapshot does not exists. Run record first.')
    }
  }

  const state = {
    specializationId: '',
    serviceAvailableId: '',
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

  for (const data of generateObject({ email: [null, ''], password: [null, ''] })) {
    await api.auth.login(data as any)
  }

  await api.auth.me()

  await api.auth.login(credentials.admin).then((res) => {
    apiLogin(res.data.accessToken)
  })

  for (const data of generateObject({
    name: [null, baseData.secretary.name],
    cnpj: [baseData.secretary.cnpj],
    cpf: [baseData.secretary.cpf],
    phone: [baseData.secretary.phone],
    email: [baseData.secretary.email],
    password: [baseData.secretary.password],
  })) {
    await api.secretaries.create(data as any)
  }

  for (const data of generateObject({ name: [] })) {
    await api.specializations.create(data as any)
  }

  await api.specializations.create({ name: 'Specialization' }).then((res) => (state.specializationId = res.data.id))
  await api.specializations.create({ name: 'Specialization' })

  for (const data of generateObject({
    name: [null, '', 'Service Available'],
    specializationId: [null, '', state.specializationId],
  })) {
    await api.servicesAvailable.create(data as any)
  }

  await api.servicesAvailable
    .create({ name: 'Service Available', specializationId: state.specializationId })
    .then((res) => (state.serviceAvailableId = res.data.id))
  await api.servicesAvailable.create({ name: 'Service Available', specializationId: state.specializationId })

  complete(w.value(), args)
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
      console.log(timeMessage + ' End')
      console.timeEnd(timeMessage + ' Time')
      snapshotLog.close()
    })
}

main()
