import axios from 'axios'
import _ from 'lodash'
import z, { ZodSafeParseResult } from 'zod'
import { addDays, addHours } from 'date-fns'

import type { DotPaths } from '../api-features'
import { responseIsError } from '../api-extensions'
import { BASE_URL } from '../config'

import { Api, Config } from '../../src/lib/api'
import {
  AppointmentSchema,
  AuthMeSchema,
  AuthTokenSchema,
  CustomerSchema,
  SecretarySchema,
  ServiceAvailableListSchema,
  ServiceAvailableSchema,
  ServiceBaseSchema,
  ServiceGroupsSchema,
  ServiceSchema,
  SpecialistSchema,
  SpecialistServiceSchema,
  SpecializationSchema,
} from '../../src/lib/api/validation'

const api = new Api(
  new Config(
    axios.create({
      baseURL: BASE_URL,
      validateStatus: (status) => status < 500,
    }),
  ),
)
const adminCredentials = {
  email: 'admin@test.com',
  password: '123mudar',
}
const secretaryCredencials = {
  email: 'secretary@test.com',
  password: '456@Mudar',
}

type Feature = DotPaths<Api>

let loggedIn: '' | 'admin' | 'secretary' = ''
const features: Feature[] = []
const ks = new Map<string, string>()
const ids: string[] = []

function depends(dependencies: Feature[]) {
  const deps = new Set(dependencies)
  for (const feature of features) {
    deps.delete(feature)
  }
  expect(Array.from(deps)).toHaveLength(0)
}

interface ZodSafeParse<T> {
  safeParse(value: unknown): ZodSafeParseResult<T>
}

declare global {
  namespace jest {
    interface Matchers<R> {
      toLossyBe<T>(expected: T, fields: string[]): R
      toParseZod<T>(schema: ZodSafeParse<T>): R
    }
  }
}

expect.extend({
  toParseZod(received: object, schema: ZodSafeParse<any>) {
    const result = schema.safeParse(received)
    if (result.success) {
      return {
        message: () => `Expected match zod schema fail but it succeeds`,
        pass: true,
      }
    } else {
      return {
        message: () => `Expected match zod schema but got errors: ${result.error}`,
        pass: false,
      }
    }
  },
  members(received: object, fields: string[]) {
    const keys = _.keys(received)
    const diff = _.difference(keys, fields)
    if (diff.length === 0) {
      return {
        message: () => `Expected ${keys} not to be ${fields}`,
        pass: true,
      }
    } else {
      return {
        message: () => `Expected ${keys} to be ${fields}`,
        pass: false,
      }
    }
  },
  toLossyBe(received, expected, fields: string[]) {
    const a = _.entries(_.pick(received, fields))
    const b = _.entries(_.pick(expected, fields))
    const pass = _.some(fields, key => this.equals(expected[key], received[key]))
    return {
      pass,
      message: () =>
        pass
          ? `Expected ${this.utils.printReceived(a)} not to ${this.utils.printExpected(b)}`
          : `Expected ${this.utils.printReceived(a)} to ${this.utils.printExpected(b)}`,
    }
  },
})

function apiLogin(accessToken: string) {
  api._config.instance.defaults.headers['Authorization'] = `Bearer ${accessToken}`
}

describe('clinic-appointments', () => {
  beforeAll(async () => {
    await api.health.healthCheck()
    await api.test.stats()
    await api.test.init()
  })

  describe('admin.auth', () => {
    describe('login', () => {
      it('should work', async () => {
        const res = await api.auth.login(adminCredentials)
        expect(res.status, JSON.stringify(res.data)).toBe(200)
        expect(res.data).toParseZod(AuthTokenSchema)
        const { accessToken, refreshToken } = res.data
        apiLogin(accessToken)
        ks.set('accessToken', accessToken)
        ks.set('refreshToken', refreshToken)
        loggedIn = 'admin'
      })
      it('should fail', async () => {
        const res = await api.auth.login({
          email: 'unknown@email.com',
          password: 'invalid-password',
        })
        expect(res.status).toBe(400)
        if (responseIsError(res)) {
          expect(res.data.trim()).toBe('invalid credentials')
        }
      })
    })

    describe('me', () => {
      it('should work', async () => {
        expect(loggedIn).toBe('admin')
        const res = await api.auth.me()
        expect(res.status, JSON.stringify(res.data)).toBe(200)
        expect(res.data).toParseZod(AuthMeSchema)
        expect(res.data.email).toBe(adminCredentials.email)
        expect(res.data.role).toBe('admin')
      })
    })

    describe('refresh', () => {
      it('should work', async () => {
        // Does a non expired refresh token return the same token?
        const accessToken = ks.get('accessToken')
        const refreshToken = ks.get('refreshToken')
        const res = await api.auth.refresh({
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        })
        expect(res.status, JSON.stringify(res.data)).toBe(200)
        expect(res.data.accessToken).toBe(accessToken)
        expect(res.data.refreshToken).toBe(refreshToken)
      })
      it('should fail', async () => {
        const accessToken = ks.get('accessToken')
        const res = await api.auth.refresh({
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        expect(res.status).toBe(400)
        if (responseIsError(res)) {
          expect(res.data.trim()).toBe('invalid token')
        }
      })
    })
  })

  describe('admin.secretaries', () => {
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

    describe('secretaries.count', () => {
      it('should work', async () => {
        expect(loggedIn).toBe('admin')
        const res = await api.secretaries.count()
        expect(res.status, JSON.stringify(res.data)).toBe(200)
        features.push('secretaries.count')
      })
    })

    describe('secretaries.create', () => {
      it('should work', async () => {
        expect(loggedIn).toBe('admin')
        depends(['secretaries.count'])
        expect((await api.secretaries.count()).data).toBe(0)
        {
          const res = await api.secretaries.create(secretaryData)
          expect(res.status, JSON.stringify(res.data)).toBe(200)
          ks.set('secretary', res.data.id)
        }
        expect((await api.secretaries.count()).data).toBe(1)
        features.push('secretaries.create')
      })
      it('should fail', async () => {
        expect(loggedIn).toBe('admin')
        depends(['secretaries.count'])
        expect((await api.secretaries.create(invalidSecretaryData)).status).toBe(400)
        expect((await api.secretaries.count()).data).toBe(1)
      })
    })

    describe('secretaries.getById', () => {
      it('should work', async () => {
        expect(loggedIn).toBe('admin')
        depends(['secretaries.create'])
        const res = await api.secretaries.getById(ks.get('secretary')!)
        expect(res.status, JSON.stringify(res.data)).toBe(200)
        expect(res.data).toParseZod(SecretarySchema)
        expect(res.data).toLossyBe(secretaryData, fields)
        features.push('secretaries.getById')
      })
      it('should fail', async () => {
        expect(loggedIn).toBe('admin')
        const res = await api.secretaries.getById('0000-0000-0000-0000')
        expect(res.status).toBe(400)
      })
    })

    describe('secretaries.create', () => {
      it('should save correctly', async () => {
        expect(loggedIn).toBe('admin')
        depends(['secretaries.create', 'secretaries.getById'])
        const res = await api.secretaries.getById(ks.get('secretary')!)
        expect(res.status, JSON.stringify(res.data)).toBe(200)
        expect(res.data).toLossyBe(secretaryData, fields)
      })
    })

    describe('secretaries.getAll', () => {
      it('should work', async () => {
        expect(loggedIn).toBe('admin')
        depends(['secretaries.create'])
        const res = await api.secretaries.getAll({ page: 0, pageSize: 20 })
        expect(res.status, JSON.stringify(res.data)).toBe(200)
        const data = _.map(res.data, (it) => _.omit(it, 'id'))
        expect(data).toEqual([_.omit(secretaryData, 'password')])
        features.push('secretaries.getAll')
      })
    })

    describe('secretaries.update', () => {
      it('should work', async () => {
        expect(loggedIn).toBe('admin')
        depends(['secretaries.create'])
        const res = await api.secretaries.update(ks.get('secretary')!, {
          name: secretaryData.name + ' Updated',
          email: secretaryData.email,
          password: undefined, // no update
          phone: '44' + secretaryData.phone.slice(2),
          cpf: secretaryData.cpf,
          cnpj: secretaryData.cnpj,
          birthdate: secretaryData.birthdate,
        })
        expect(res.status, JSON.stringify(res.data)).toBe(200)
      })

      it('should save correctly', async () => {
        expect(loggedIn).toBe('admin')
        depends(['secretaries.create', 'secretaries.getById'])
        const res = await api.secretaries.getById(ks.get('secretary')!)
        expect(res.status, JSON.stringify(res.data)).toBe(200)
        expect(res.data).not.toLossyBe(secretaryData, ['name', 'phone'])
        expect(res.data).toLossyBe(secretaryData, _.difference(fields, ['name', 'phone']))
        features.push('secretaries.update')
      })
    })

    describe('secretaries.delete', () => {
      it('should work', async () => {
        expect(loggedIn).toBe('admin')
        depends(['secretaries.create', 'secretaries.count'])
        const res = await api.secretaries.delete(ks.get('secretary')!)
        expect(res.status).toBe(204)
        expect((await api.secretaries.count()).data).toBe(0)
        features.push('secretaries.delete')
      })
    })

    describe('(side-effect) create secretary', () => {
      it('should work', async () => {
        expect(loggedIn).toBe('admin')
        depends(['secretaries.create'])
        const res = await api.secretaries.create(secretaryData)
        expect(res.status, JSON.stringify(res.data)).toBe(200)
      })
    })
  })

  describe('secretary.auth', () => {
    describe('login', () => {
      it('should work', async () => {
        const res = await api.auth.login(secretaryCredencials)
        expect(res.status, JSON.stringify(res.data)).toBe(200)
        expect(res.data).toHaveProperty('accessToken')
        expect(res.data).toHaveProperty('refreshToken')
        const { accessToken } = res.data
        apiLogin(accessToken)
        loggedIn = 'secretary'
      })
    })
  })

  describe('secretary.specializations', () => {
    describe('specializations.getAll', () => {
      it('should work (0)', async () => {
        expect(loggedIn).toBe('secretary')
        const res = await api.specializations.getAll()
        expect(res.status, JSON.stringify(res.data)).toBe(200)
        expect(res.data).toEqual([])
      })
    })

    describe('specializations.create', () => {
      it('should work (A)', async () => {
        expect(loggedIn).toBe('secretary')
        const res = await api.specializations.create({ name: 'Specialization A' })
        expect(res.status, JSON.stringify(res.data)).toBe(200)
        expect(typeof res.data).toBe('string')
        ks.set('specialization-a', res.data)
        features.push('specializations.create')
      })
      it('should work (B)', async () => {
        expect(loggedIn).toBe('secretary')
        const res = await api.specializations.create({ name: 'Specialization B' })
        expect(res.status, JSON.stringify(res.data)).toBe(200)
        expect(typeof res.data).toBe('string')
        ks.set('specialization-b', res.data)
      })

      it('should fail (A again)', async () => {
        expect(loggedIn).toBe('secretary')
        const res = await api.specializations.create({ name: 'Specialization A' })
        expect(res.status).toBe(400)
        expect(res.data.trim()).toBe('specialization.name: resource already exists')
      })
      it('should fail (empty)', async () => {
        expect(loggedIn).toBe('secretary')
        const res = await api.specializations.create({ name: '' })
        expect(res.status).toBe(400)
        expect(res.data.trim()).toBe('invalid argument: name: field is required')
      })
    })

    describe('specializations.getAll', () => {
      it('should work', async () => {
        expect(loggedIn).toBe('secretary')
        depends(['specializations.create'])
        const res = await api.specializations.getAll()
        expect(res.status, JSON.stringify(res.data)).toBe(200)
        expect(res.data).toParseZod(z.array(SpecializationSchema))
        expect(res.data).toEqual([
          { id: ks.get('specialization-a'), name: 'Specialization A' },
          { id: ks.get('specialization-b'), name: 'Specialization B' },
        ])
      })
    })

    describe('specializations.update', () => {
      it('should work', async () => {
        expect(loggedIn).toBe('secretary')
        depends(['specializations.create'])
        const res = await api.specializations.update(ks.get('specialization-a')!, { name: 'Specialization A Updated' })
        expect(res.status, JSON.stringify(res.data)).toBe(200)
        features.push('specializations.update')
      })
      it('should fail', async () => {
        expect(loggedIn).toBe('secretary')
        depends(['specializations.create'])
        const res = await api.specializations.update(ks.get('specialization-a')!, { name: '' })
        expect(res.status).toBe(400)
        expect(res.data.trim()).toBe('invalid argument: name: field is required')
      })
    })

    describe('specializations.delete', () => {
      it('should work A', async () => {
        expect(loggedIn).toBe('secretary')
        depends(['specializations.create'])
        const res = await api.specializations.delete(ks.get('specialization-a')!)
        expect(res.status).toBe(204)
        features.push('specializations.delete')
      })
      it('should work B', async () => {
        expect(loggedIn).toBe('secretary')
        depends(['specializations.create'])
        const res = await api.specializations.delete(ks.get('specialization-b')!)
        expect(res.status).toBe(204)
      })
    })

    describe('(side-effect) create specializations', () => {
      it('should work', async () => {
        expect(loggedIn).toBe('secretary')
        depends(['specializations.create'])
        const resA = await api.specializations.create({ name: 'Specialization A' })
        ks.set('specialization-a', resA.data)
        const resB = await api.specializations.create({ name: 'Specialization B' })
        ks.set('specialization-b', resB.data)
      })
    })
  })

  describe('secretary.servicesAvailable', () => {
    describe('servicesAvailable.getAll', () => {
      it('should work (2-0)', async () => {
        expect(loggedIn).toBe('secretary')
        const res = await api.servicesAvailable.getAll()
        expect(res.status, JSON.stringify(res.data)).toBe(200)
        expect(res.data.length).toBe(2)
        _.forEach(res.data, (it) => {
          expect(it.items.length).toBe(0)
        })
        features.push('servicesAvailable.getAll')
      })
    })

    describe('servicesAvailable.create', () => {
      it.each([{ suffix: 'A' }, { suffix: 'B' }])('should work (A-$suffix)', async ({ suffix }) => {
        expect(loggedIn).toBe('secretary')
        const res = await api.servicesAvailable.create({
          name: `Service Available ${suffix}`,
          specializationId: ks.get('specialization-a'),
        })
        expect(res.status, JSON.stringify(res.data)).toBe(200)
        expect(typeof res.data).toBe('string')
        ids.push(res.data)
      })
      it.each([{ suffix: '1' }, { suffix: '2' }])('should work (B-$suffix)', async ({ suffix }) => {
        expect(loggedIn).toBe('secretary')
        const res = await api.servicesAvailable.create({
          name: `Service Available ${suffix}`,
          specializationId: ks.get('specialization-b'),
        })
        expect(res.status, JSON.stringify(res.data)).toBe(200)
        expect(typeof res.data).toBe('string')
        ids.push(res.data)
      })

      it('should work (count)', () => {
        expect(ids.length).toBe(4)
        features.push('servicesAvailable.create')
      })

      it('should fail', async () => {
        expect(loggedIn).toBe('secretary')
        const res = await api.servicesAvailable.create({
          name: ``,
          specializationId: ks.get('specialization-b'),
        })
        expect(res.status).toBe(400)
        expect(res.data.trim()).toBe('invalid argument: name: field is required')
      })
    })

    describe('servicesAvailable.getAll', () => {
      it('should work (2-4)', async () => {
        expect(loggedIn).toBe('secretary')
        depends(['servicesAvailable.create'])
        const res = await api.servicesAvailable.getAll()
        expect(res.status, JSON.stringify(res.data)).toBe(200)
        expect(res.data).toParseZod(ServiceAvailableListSchema)
        expect(res.data.length).toBe(2)
        _.forEach(res.data, (it) => {
          expect(it.items.length).toBe(2)
        })
        features.push('servicesAvailable.getAll')
      })
    })

    describe('servicesAvailable.getById', () => {
      it('should work (Created)', async () => {
        expect(loggedIn).toBe('secretary')
        depends(['servicesAvailable.create'])
        const res = await api.servicesAvailable.getById(ids[0])
        expect(res.status, JSON.stringify(res.data)).toBe(200)
        expect(res.data).toParseZod(ServiceAvailableSchema)
        expect(res.data.serviceName).toEqual('Service Available A')
      })
    })

    describe('servicesAvailable.update', () => {
      it('should work', async () => {
        expect(loggedIn).toBe('secretary')
        depends(['servicesAvailable.create'])
        const res = await api.servicesAvailable.update(ids[0], {
          name: 'Updated',
        })
        expect(res.status, JSON.stringify(res.data)).toBe(200)
        features.push('servicesAvailable.update')
      })

      it('should fail', async () => {
        expect(loggedIn).toBe('secretary')
        depends(['servicesAvailable.create'])
        const res = await api.servicesAvailable.update(ids[0], {
          name: '',
        })
        expect(res.status).toBe(400)
      })
    })

    describe('servicesAvailable.getById', () => {
      it('should work (Updated)', async () => {
        expect(loggedIn).toBe('secretary')
        depends(['servicesAvailable.update'])
        const res = await api.servicesAvailable.getById(ids[0])
        expect(res.status, JSON.stringify(res.data)).toBe(200)
        expect(res.data.serviceName).toEqual('Updated')
      })
    })

    describe('servicesAvailable.delete', () => {
      it('should work', async () => {
        for await (const id of ids) {
          const res = await api.servicesAvailable.delete(id)
          expect(res.status).toBe(204)
        }
        ids.length = 0
        features.push('servicesAvailable.delete')
      })
    })

    describe('(side-effect) create services available', () => {
      it('should works', async () => {
        const values = [
          { service: 'service-available-aa', specialization: 'specialization-a' },
          { service: 'service-available-ba', specialization: 'specialization-a' },
          { service: 'service-available-ab', specialization: 'specialization-b' },
          { service: 'service-available-bb', specialization: 'specialization-b' },
        ]
        for await (const args of values) {
          const res = await api.servicesAvailable.create({
            name: args.service,
            specializationId: ks.get(args.specialization),
          })
          expect(res.status, JSON.stringify(res.data)).toBe(200)
          expect(typeof res.data).toBe('string')
          ks.set(args.service, res.data)
        }
      })
    })
  })

  describe('secretary.serviceGroups', () => {
    describe('serviceGroups.getAll', () => {
      it('should work', async () => {
        expect(loggedIn).toBe('secretary')
        depends(['specializations.create'])
        const res = await api.serviceGroups.getAll()
        expect(res.status, JSON.stringify(res.data)).toBe(200)
        expect(res.data).toParseZod(ServiceGroupsSchema)
        expect(res.data.length).toBe(2)
        for (const group of res.data) {
          expect(group.items.length).toBe(2)
        }
      })
    })
  })

  describe('secretary.specialists', () => {
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

    describe('specialists.getAll', () => {
      it('should work (0)', async () => {
        expect(loggedIn).toBe('secretary')
        const res = await api.specialists.getAll({ page: 0, pageSize: 20 })
        expect(res.status, JSON.stringify(res.data)).toBe(200)
        expect(res.data).toEqual([])
      })
    })

    describe('specialists.count', () => {
      it('should work (0)', async () => {
        expect(loggedIn).toBe('secretary')
        const res = await api.specialists.count()
        expect(res.status, JSON.stringify(res.data)).toBe(200)
        expect(res.data).toEqual(0)
      })
    })

    describe('specialists.create', () => {
      it('should work', async () => {
        expect(loggedIn).toBe('secretary')
        const res = await api.specialists.create(specialistData)
        expect(res.status, JSON.stringify(res.data)).toBe(200)
        expect(typeof res.data).toBe('string')
        ids.push(res.data)
        features.push('specialists.create')
      })
    })

    describe('specialists.getAll', () => {
      it('should work (1)', async () => {
        expect(loggedIn).toBe('secretary')
        depends(['specialists.create'])
        const res = await api.specialists.getAll({ page: 0, pageSize: 20 })
        expect(res.status, JSON.stringify(res.data)).toBe(200)
        expect(res.data.length).toEqual(1)
        expect(res.data).toParseZod(z.array(SpecialistSchema))
      })
    })

    describe('specialists.count', () => {
      it('should work (1)', async () => {
        expect(loggedIn).toBe('secretary')
        depends(['specialists.create'])
        const res = await api.specialists.count()
        expect(res.status, JSON.stringify(res.data)).toBe(200)
        expect(res.data).toEqual(1)
        features.push('specialists.count')
      })
    })

    describe('specialists.getById', () => {
      it('should work (Created)', async () => {
        expect(loggedIn).toBe('secretary')
        depends(['specialists.create'])
        const res = await api.specialists.getById(ids[0])
        expect(res.status, JSON.stringify(res.data)).toBe(200)
        expect(res.data).toParseZod(SpecialistSchema)
        expect(res.data).toLossyBe(specialistData, fields)
        features.push('specialists.getById')
      })
    })

    describe('specialists.getServices', () => {
      it('should work (0)', async () => {
        expect(loggedIn).toBe('secretary')
        depends(['specialists.create'])
        const res = await api.specialists.getServices(ids[0])
        expect(res.status, JSON.stringify(res.data)).toBe(200)
        expect(res.data).toEqual([])
      })
    })

    describe('specialists.update', () => {
      it('should work', async () => {
        expect(loggedIn).toBe('secretary')
        depends(['specialists.create'])
        const res = await api.specialists.update(ids[0], {
          name: specialistData.name + ' Updated',
          email: specialistData.email,
          phone: '44' + specialistData.phone.slice(2),
          cnpj: specialistData.cnpj,
          cpf: specialistData.cpf,
          birthdate: '1999-08-07',
          services: [],
        })
        expect(res.status, JSON.stringify(res.data)).toBe(200)
        features.push('specialists.update')
      })
    })

    describe('specialists.getById', () => {
      it('should work (Updated)', async () => {
        expect(loggedIn).toBe('secretary')
        depends(['specialists.update'])
        const res = await api.specialists.getById(ids[0])
        expect(res.status, JSON.stringify(res.data)).toBe(200)
        expect(res.data).not.toLossyBe(specialistData, ['name', 'phone', 'birthdate'])
      })
    })

    describe('specialists.delete', () => {
      it('should work', async () => {
        expect(loggedIn).toBe('secretary')
        depends(['specialists.create'])
        const res = await api.specialists.delete(ids[0])
        expect(res.status).toBe(204)
        features.push('specialists.delete')
        ids.length = 0
      })
    })

    describe('specialists.count', () => {
      it('should work (Removed)', async () => {
        expect(loggedIn).toBe('secretary')
        depends(['specialists.delete'])
        const res = await api.specialists.count()
        expect(res.status, JSON.stringify(res.data)).toBe(200)
        expect(res.data).toEqual(0)
        features.push('specialists.count')
      })
    })

    describe('specialists.create', () => {
      it('should work (+services)', async () => {
        expect(loggedIn).toBe('secretary')
        depends(['specialists.create'])
        const res = await api.specialists.create({
          ...specialistData,
          services: [
            { serviceNameId: ks.get('service-available-aa')!, price: 100, duration: 60 },
            { serviceNameId: ks.get('service-available-ba')!, price: 200, duration: 120 },
          ],
        })
        expect(res.status, JSON.stringify(res.data)).toBe(200)
        expect(typeof res.data).toBe('string')
        ids.push(res.data)
      })
    })

    describe('specialists.getServices', () => {
      it('should work (+services)', async () => {
        expect(loggedIn).toBe('secretary')
        depends(['specialists.create'])
        const res = await api.specialists.getServices(ids[0])
        expect(res.status, JSON.stringify(res.data)).toBe(200)
        expect(res.data).toParseZod(z.array(SpecialistServiceSchema))
        expect(res.data.length).toBe(2)
      })
    })

    describe('specialists.getSpecializations', () => {
      it('should work (+services)', async () => {
        expect(loggedIn).toBe('secretary')
        depends(['specialists.create'])
        const res = await api.specialists.getSpecializations(ids[0])
        expect(res.status, JSON.stringify(res.data)).toBe(200)
        expect(res.data).toParseZod(z.array(SpecializationSchema))
        expect(res.data.length).toBe(1)
      })
    })

    describe('specialists.delete', () => {
      it('should work (+services)', async () => {
        expect(loggedIn).toBe('secretary')
        depends(['specialists.create'])
        const res = await api.specialists.delete(ids[0])
        expect(res.status).toBe(204)
        ids.length = 0
      })
    })

    describe('(side-effect) create specialists', () => {
      it('should work', async () => {
        expect(loggedIn).toBe('secretary')
        depends(['specialists.create'])
        const res = await api.specialists.create({
          ...specialistData,
          services: [
            { serviceNameId: ks.get('service-available-aa')!, price: 100, duration: 60 },
            { serviceNameId: ks.get('service-available-ab')!, price: 200, duration: 120 },
          ],
        })
        ks.set('specialist', res.data)
      })
    })
  })

  describe('secretary.services', () => {
    describe('services.getAll', () => {
      it('should work (2)', async () => {
        expect(loggedIn).toBe('secretary')
        const res = await api.services.getAll()
        expect(res.status, JSON.stringify(res.data)).toBe(200)
        expect(res.data.length).toEqual(2)
        expect(res.data).toParseZod(z.array(ServiceSchema))
      })
    })
    describe('services.count', () => {
      it('should work (2)', async () => {
        expect(loggedIn).toBe('secretary')
        const res = await api.services.count()
        expect(res.status, JSON.stringify(res.data)).toBe(200)
        expect(res.data).toBe(2)
      })
    })
    describe('services.create', () => {
      it('should work', async () => {
        expect(loggedIn).toBe('secretary')
        const res = await api.services.create({
          duration: 60,
          price: 1000,
          serviceNameId: ks.get('service-available-bb')!,
          specialistId: ks.get('specialist')!,
        })
        expect(res.status, JSON.stringify(res.data)).toBe(200)
        expect(typeof res.data).toBe('string')
        ids.push(res.data)
        features.push('services.create')
      })
    })
    describe('services.count', () => {
      it('should work', async () => {
        expect(loggedIn).toBe('secretary')
        depends(['services.create'])
        const res = await api.services.count()
        expect(res.status, JSON.stringify(res.data)).toBe(200)
        expect(res.data).toBe(3)
      })
    })
    describe('services.getById', () => {
      it('should work (Created)', async () => {
        expect(loggedIn).toBe('secretary')
        depends(['services.create'])
        const res = await api.services.getById(ids[0])
        expect(res.status, JSON.stringify(res.data)).toBe(200)
        expect(res.data).toParseZod(ServiceBaseSchema)
      })
    })
    describe('services.update', () => {
      it('should work', async () => {
        expect(loggedIn).toBe('secretary')
        depends(['services.create'])
        const res = await api.services.update(ids[0], {
          duration: 30,
          price: 500,
          serviceNameId: ks.get('service-available-ba')!,
        })
        expect(res.status, JSON.stringify(res.data)).toBe(200)
        features.push('services.update')
      })
    })
    describe('services.getById', () => {
      it('should work (Updated)', async () => {
        expect(loggedIn).toBe('secretary')
        depends(['services.update'])
        const res = await api.services.getById(ids[0])
        expect(res.status, JSON.stringify(res.data)).toBe(200)
        expect(res.data).toParseZod(ServiceBaseSchema)
        expect(res.data).toLossyBe({ duration: 30, price: 500 }, ['duration', 'price'])
      })
    })
    describe('services.delete', () => {
      it('should work', async () => {
        expect(loggedIn).toBe('secretary')
        depends(['services.update'])
        const res = await api.services.delete(ids[0])
        expect(res.status).toBe(204)
      })
    })

    describe('(side-effect) create services', () => {
      it('should work', async () => {
        expect(loggedIn).toBe('secretary')
        depends(['services.create'])
        const res = await api.services.create({
          duration: 60,
          price: 1000,
          serviceNameId: ks.get('service-available-bb')!,
          specialistId: ks.get('specialist')!,
        })
        ks.set('service', res.data)
      })
    })
  })

  describe('secretary.customers', () => {
    const ids: string[] = []
    const fields = ['name', 'email', 'cpf', 'birthdate', 'phone']
    const customerData = {
      name: 'Customer Test',
      email: 'customer@test.com',
      cpf: '11431287962',
      birthdate: '1999-08-08',
      phone: '21987654321',
    }

    describe('customers.getAll', () => {
      it('should work (0)', async () => {
        expect(loggedIn).toBe('secretary')
        const res = await api.customers.getAll()
        expect(res.status, JSON.stringify(res.data)).toBe(200)
        expect(res.data).toEqual([])
      })
    })

    describe('customers.count', () => {
      it('should work (0)', async () => {
        expect(loggedIn).toBe('secretary')
        const res = await api.customers.count()
        expect(res.status, JSON.stringify(res.data)).toBe(200)
        expect(res.data).toEqual(0)
      })
    })

    describe('customers.create', () => {
      it('should work', async () => {
        expect(loggedIn).toBe('secretary')
        const res = await api.customers.create(customerData)
        expect(res.status, JSON.stringify(res.data)).toBe(200)
        expect(typeof res.data).toBe('string')
        ids.push(res.data)
        features.push('customers.create')
      })
    })

    describe('customers.getAll', () => {
      it('should work (1)', async () => {
        expect(loggedIn).toBe('secretary')
        depends(['customers.create'])
        const res = await api.customers.getAll({ page: 0, pageSize: 20 })
        expect(res.status, JSON.stringify(res.data)).toBe(200)
        expect(res.data.length).toEqual(1)
        expect(res.data).toParseZod(z.array(CustomerSchema))
      })
    })

    describe('customers.count', () => {
      it('should work (1)', async () => {
        expect(loggedIn).toBe('secretary')
        depends(['customers.create'])
        const res = await api.customers.count()
        expect(res.status, JSON.stringify(res.data)).toBe(200)
        expect(res.data).toEqual(1)
        features.push('customers.count')
      })
    })

    describe('customers.getById', () => {
      it('should work (Created)', async () => {
        expect(loggedIn).toBe('secretary')
        depends(['customers.create'])
        const res = await api.customers.getById(ids[0])
        expect(res.status, JSON.stringify(res.data)).toBe(200)
        expect(res.data).toParseZod(CustomerSchema)
        expect(res.data).toLossyBe(customerData, fields)
        features.push('customers.getById')
      })
    })

    describe('customers.update', () => {
      it('should work', async () => {
        expect(loggedIn).toBe('secretary')
        depends(['customers.create'])
        const res = await api.customers.update(ids[0], {
          name: customerData.name + ' Updated',
          email: customerData.email,
          phone: '44' + customerData.phone.slice(2),
          cpf: customerData.cpf,
          birthdate: '1999-08-07',
        })
        expect(res.status, JSON.stringify(res.data)).toBe(200)
        features.push('customers.update')
      })
    })

    describe('customers.getById', () => {
      it('should work (Updated)', async () => {
        expect(loggedIn).toBe('secretary')
        depends(['customers.update'])
        const res = await api.customers.getById(ids[0])
        expect(res.status, JSON.stringify(res.data)).toBe(200)
        expect(res.data).not.toLossyBe(customerData, ['name', 'phone', 'birthdate'])
      })
    })

    describe('customers.delete', () => {
      it('should work', async () => {
        expect(loggedIn).toBe('secretary')
        depends(['customers.create'])
        const res = await api.customers.delete(ids[0])
        expect(res.status).toBe(204)
        features.push('customers.delete')
        ids.length = 0
      })
    })

    describe('customers.count', () => {
      it('should work (Removed)', async () => {
        expect(loggedIn).toBe('secretary')
        depends(['customers.delete'])
        const res = await api.customers.count()
        expect(res.status, JSON.stringify(res.data)).toBe(200)
        expect(res.data).toEqual(0)
        features.push('customers.count')
      })
    })

    describe('(side-effect) create customers', () => {
      it('should work', async () => {
        expect(loggedIn).toBe('secretary')
        depends(['customers.create'])
        const res = await api.customers.create({ ...customerData })
        ks.set('customer', res.data)
      })
    })
  })

  describe('secretary.appointments', () => {
    const ids: string[] = []
    const createDate = addDays(new Date(), 1)
    const createDateIso = createDate.toISOString()
    const updateDate = addHours(addDays(createDate, 2), 1)
    const updateDateIso = updateDate.toISOString()

    const fields = ['date', 'time']
    const appointmentData = {
      date: createDateIso.slice(0, 10),
      time: createDateIso.slice(11, 11 + 8),
    }

    describe('appointments.getAll', () => {
      it('should work (0)', async () => {
        expect(loggedIn).toBe('secretary')
        const res = await api.appointments.getAll({})
        expect(res.status, JSON.stringify(res.data)).toBe(200)
        expect(res.data).toEqual([])
      })
    })

    describe('appointments.count', () => {
      it('should work (0)', async () => {
        expect(loggedIn).toBe('secretary')
        const res = await api.appointments.count()
        expect(res.status, JSON.stringify(res.data)).toBe(200)
        expect(res.data).toEqual(0)
      })
    })

    describe('appointments.create', () => {
      it('should work', async () => {
        expect(loggedIn).toBe('secretary')
        depends(['customers.create'])
        const res = await api.appointments.create({
          date: createDateIso.slice(0, 10),
          time: createDateIso.slice(11, 11 + 8),
          customerId: ks.get('customer')!,
          serviceId: ks.get('service')!,
        })
        expect(res.status, JSON.stringify(res.data)).toBe(200)
        expect(typeof res.data).toBe('string')
        ids.push(res.data)
        features.push('appointments.create')
      })
    })

    describe('appointments.getAll', () => {
      it('should work (1)', async () => {
        expect(loggedIn).toBe('secretary')
        depends(['appointments.create'])
        const res = await api.appointments.getAll({ page: 0, pageSize: 20 })
        expect(res.status, JSON.stringify(res.data)).toBe(200)
        expect(res.data.length).toEqual(1)
        expect(res.data).toParseZod(z.array(AppointmentSchema))
      })
    })

    describe('appointments.count', () => {
      it('should work (1)', async () => {
        expect(loggedIn).toBe('secretary')
        depends(['appointments.create'])
        const res = await api.appointments.count()
        expect(res.status, JSON.stringify(res.data)).toBe(200)
        expect(res.data).toEqual(1)
        features.push('appointments.count')
      })
    })

    describe('appointments.getById', () => {
      it('should work (Created)', async () => {
        expect(loggedIn).toBe('secretary')
        depends(['specialists.create'])
        const res = await api.appointments.getById(ids[0])
        expect(res.status, JSON.stringify(res.data)).toBe(200)
        expect(res.data).toParseZod(AppointmentSchema)
        expect(res.data).toLossyBe(appointmentData, fields)
        features.push('appointments.getById')
      })
    })

    describe('appointments.update', () => {
      it('should work', async () => {
        expect(loggedIn).toBe('secretary')
        depends(['appointments.create'])
        const res = await api.appointments.update(ids[0], {
          date: updateDateIso.slice(0, 10),
          time: updateDateIso.slice(11, 11 + 8),
          status: 2,
        })
        expect(res.status, JSON.stringify(res.data)).toBe(200)
        features.push('appointments.update')
      })
    })

    describe('appointments.getById', () => {
      it('should work (Updated)', async () => {
        expect(loggedIn).toBe('secretary')
        depends(['appointments.update'])
        const res = await api.appointments.getById(ids[0])
        expect(res.status, JSON.stringify(res.data)).toBe(200)
        expect(res.data).not.toLossyBe(appointmentData, ['date', 'time'])
      })
    })

    describe('appointments.delete', () => {
      it('should work', async () => {
        expect(loggedIn).toBe('secretary')
        depends(['appointments.create'])
        const res = await api.appointments.delete(ids[0])
        expect(res.status).toBe(204)
        features.push('appointments.delete')
        ids.length = 0
      })
    })

    describe('appointments.count', () => {
      it('should work (Removed)', async () => {
        expect(loggedIn).toBe('secretary')
        depends(['appointments.delete'])
        const res = await api.appointments.count()
        expect(res.status, JSON.stringify(res.data)).toBe(200)
        expect(res.data).toEqual(0)
        features.push('appointments.count')
      })
    })

    describe('(side-effect) create appointments', () => {
      it('should work', async () => {
        expect(loggedIn).toBe('secretary')
        const res = await api.appointments.create({
          date: updateDateIso.slice(0, 10),
          time: updateDateIso.slice(11, 11 + 8),
          customerId: ks.get('customer')!,
          serviceId: ks.get('service')!,
        })
        expect(res.status, JSON.stringify(res.data)).toBe(200)
        expect(typeof res.data).toBe('string')
        ks.set('appointment', res.data)
      })
    })
  })
})

function describ(...args: any[]) {}
