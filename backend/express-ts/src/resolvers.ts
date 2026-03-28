import bcrypt from 'bcrypt'
import { type Request, type Response } from 'express'
import { db } from './db'
import { getAppConfig, getDatabaseConfig, listConfiguredResources } from './config'
import { validate as isUuid } from 'uuid'
import { generateAccessJWT, generateRefreshJWT, getJwtData, isRefreshToken, JwtData } from './jwt'

const saltRounds = 10

async function hashPassword(password: string) {
  const hash = await bcrypt.hash(password, saltRounds)
  return hash
}

async function verifyPassword(password: string, hash: string) {
  return await bcrypt.compare(password, hash)
}

function getAccessTokenFromRequest(req: Request) {
  const bearer = req.header('authorization')
  if (!bearer) return null
  const prefix = 'Bearer '
  if (!bearer.startsWith(prefix)) return null
  return bearer.slice(prefix.length).trimStart()
}

async function getJwtDataFromRequest(req: Request) {
  const accessToken = getAccessTokenFromRequest(req)
  if (!accessToken) return null
  const jwtData = await getJwtData(accessToken)
  if (isRefreshToken(jwtData)) return null
  const [ok] = parseUuid(jwtData.userId)
  if (!ok) return null
  return jwtData
}

function getDatePart(isodate: string): string {
  return isodate.slice(0, 10)
}

type Brand<T, B> = T & { readonly __brand: B }

type UUID = Brand<string, 'UUID'>

type Res<T> = [true, T] | [false, string]

function parseUuid(value: unknown): Res<UUID> {
  if (typeof value != 'string') return [false, 'uuid must be a string']
  if (!isUuid(value)) return [false, 'invalid uuid format']
  return [true, value as UUID]
}

function getAndParseUuidParam(req: Request, res: Response, paramName: string): UUID | null {
  const [ok, value] = parseUuid(req.params[paramName])
  if (ok) return value
  res.status(400).send('invalid uuid param: ' + paramName)
  return null
}

async function getIdentity(where: { email: string } | { id: string }) {
  const admin = await db.admins.findUnique({ where })

  if (admin) {
    return {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      password: admin.password,
      role: 'admin',
    }
  }

  const secretary = await db.secretaries.findUnique({ where })

  if (secretary) {
    return {
      id: secretary.id,
      name: secretary.name,
      email: secretary.email,
      password: secretary.password,
      role: 'secretary',
    }
  }

  return null
}

const presenter = {
  secretary(row: any /** Prima result */): any {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      birthdate: getDatePart(row.birthdate.toISOString()),
      cpf: row.cpf,
      cnpj: row.cnpj,
    }
  },
}

export default {
  health: {
    async healthCheck(req: Request, res: Response) {
      const resourcesCheck: Record<string, (() => Promise<any>) | undefined> = {
        app: async () => {},
        jwt: async () => {},
        database: async () => {
          type DbInfo = {
            version: string
            max_connections: number
            opened_connections: number
            schema_version: number
          }

          const dbConfig = getDatabaseConfig()

          try {
            const rows = await db.$queryRaw<DbInfo[]>`SELECT
              current_setting('server_version') as version,
              current_setting('max_connections')::int as max_connections,
              (SELECT count(*)::int FROM pg_stat_activity WHERE datname = ${dbConfig.name}) as opened_connections,
              (SELECT version FROM schema_version) as schema_version;`
            response.database = {
              status: 'connected',
              version: rows[0].version,
              maxConnections: rows[0].max_connections,
              openedConnections: rows[0].opened_connections,
              schemaVersion: rows[0].schema_version,
            }
          } catch (error) {
            console.error(error)
            response.status = false
            response.database = {
              status: 'disconnected',
              version: '',
              maxConnections: 0,
              openedConnections: 0,
              schemaVersion: 0,
            }
          }
        },
      }

      type HealthResponse = {
        status: boolean
        updatedAt: string
        environment: string
        database?: {
          status: string
          version: string
          maxConnections: number
          openedConnections: number
          schemaVersion: number
        }
      }

      const appConfig = getAppConfig()
      const response: HealthResponse = {
        status: true,
        updatedAt: new Date().toISOString(),
        environment: appConfig.environemnt,
      }

      for (const resource of listConfiguredResources()) {
        const resourceCheck = resourcesCheck[resource]
        if (!resourceCheck) {
          console.warn('WARNING: resource check not implemented: ' + resource)
          continue
        }
        await resourceCheck()
      }

      res.json(response)
    },
  },
  auth: {
    async login(req: Request, res: Response) {
      const args = {
        email: req.body.email,
        password: req.body.password,
      }

      const identity = await getIdentity({ email: args.email })

      if (!identity) {
        res.send('invalid credentials\n')
        return
      }

      const validPassword = await verifyPassword(args.password, identity.password)
      if (!validPassword) {
        res.send('invalid credentials\n')
        return
      }

      const data: JwtData = {
        userId: identity.id,
        role: identity.role,
      }

      const accessToken = generateAccessJWT(data)
      const refreshToken = generateRefreshJWT(data)

      res.json({ accessToken, refreshToken })
    },
    async refresh(req: Request, res: Response) {
      const refreshToken = getAccessTokenFromRequest(req)
      if (!refreshToken) {
        res.status(400).send('invalid token\n')
        return
      }

      const jwtData = await getJwtData(refreshToken).catch(() => null)
      if (!jwtData || !isRefreshToken(jwtData)) {
        res.status(400).send('invalid token\n')
        return
      }

      const [ok, userIdOrError] = parseUuid(jwtData.userId)
      if (!ok) {
        console.error('ERROR:', userIdOrError)
        res.status(400).send('something went wrong\n')
        return
      }

      const identity = await getIdentity({ id: userIdOrError })
      if (!identity) {
        res.status(400).send('invalid token\n')
        return
      }

      const data: JwtData = {
        role: identity.role,
        userId: identity.id,
      }

      const accessToken = generateAccessJWT(data)

      res.json({ accessToken, refreshToken })
    },
    async me(req: Request, res: Response) {
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        res.status(400).send('invalid token\n')
        return
      }

      const identity = await getIdentity({ id: jwtData.userId })
      if (!identity) {
        res.status(400).send('invalid token\n')
        return
      }

      res.json({
        id: identity.id,
        name: identity.name,
        email: identity.email,
        role: identity.role,
      })
    },
  },
  appointments: {
    async getAll(req: Request, res: Response) {
      res.send('OK')
    },
    async create(req: Request, res: Response) {
      res.send('OK')
    },
    async count(req: Request, res: Response) {
      const count = await db.appointments.count({})
      res.send(count)
    },
    async getCalendar(req: Request, res: Response) {
      res.send('OK')
    },
    async getCalendarCount(req: Request, res: Response) {
      res.send('OK')
    },
    async getById(req: Request, res: Response) {
      res.send('OK')
    },
    async update(req: Request, res: Response) {
      res.send('OK')
    },
    async delete(req: Request, res: Response) {
      res.send('OK')
    },
  },
  customers: {
    async getAll(req: Request, res: Response) {
      res.send('OK')
    },
    async create(req: Request, res: Response) {
      res.send('OK')
    },
    async count(req: Request, res: Response) {
      const count = await db.customers.count({})
      res.send(count)
    },
    async getById(req: Request, res: Response) {
      res.send('OK')
    },
    async update(req: Request, res: Response) {
      res.send('OK')
    },
    async delete(req: Request, res: Response) {
      res.send('OK')
    },
  },
  secretaries: {
    async getAll(req: Request, res: Response) {
      const rows = await db.secretaries.findMany({
        orderBy: { name: 'asc' },
      })
      res.json(rows.map((row) => presenter.secretary(row)))
    },
    async create(req: Request, res: Response) {
      const args = {
        birthdate: req.body.birthdate as string,
        cpf: req.body.cpf as string,
        email: req.body.email as string,
        name: req.body.name as string,
        password: req.body.password as string,
        phone: req.body.phone as string,
        cnpj: req.body.cnpj as string,
      }

      const exists = await db.secretaries.findUnique({
        where: { email: args.email },
      })

      if (exists) {
        res.status(400).send('secretary.email: resource already exists\n')
        return
      }

      const row = await db.secretaries.create({
        data: {
          birthdate: new Date(args.birthdate),
          cpf: args.cpf,
          email: args.email,
          name: args.name,
          password: await hashPassword(args.password),
          phone: args.phone,
          cnpj: args.cnpj,
        },
      })
      res.json({ id: row.id })
    },
    async count(req: Request, res: Response) {
      const count = await db.secretaries.count({})
      res.send(count)
    },
    async getById(req: Request, res: Response) {
      const id = getAndParseUuidParam(req, res, 'id')
      if (!id) return

      const row = await db.secretaries.findFirst({
        where: { id },
      })

      if (!row) {
        res.status(400).send('secretary: resource not found\n')
        return
      }

      res.json(presenter.secretary(row))
    },
    async update(req: Request, res: Response) {
      const args = {
        name: req.body.name as string | undefined,
        email: req.body.email as string | undefined,
        phone: req.body.phone as string | undefined,
        birthdate: req.body.birthdate as string | undefined,
        cpf: req.body.cpf as string | undefined,
        cnpj: req.body.cnpj as string | undefined,
        password: req.body.password as string | undefined,
      }

      const id = getAndParseUuidParam(req, res, 'id')
      if (!id) return

      const data = {
        name: args.name ? args.name : undefined,
        email: args.email ? args.email : undefined,
        phone: args.phone ? args.phone : undefined,
        birthdate: args.birthdate ? new Date(args.birthdate) : undefined,
        cpf: args.cpf ? args.cpf : undefined,
        cnpj: args.cnpj ? args.cnpj : undefined,
        password: args.password ? await hashPassword(args.password) : undefined,
      }

      const row = await db.secretaries.findFirst({
        where: { id },
      })

      if (!row) {
        res.status(400).send('secretary: resource not found\n')
        return
      }

      if (data.email && row.email !== data.email) {
        const exists = await db.secretaries.findUnique({
          where: { email: data.email },
        })

        if (exists) {
          res.status(400).send('secretary.email: resource already exists\n')
          return
        }
      }

      await db.secretaries.update({
        where: { id },
        data,
      })

      res.json({ id: row.id })
    },
    async delete(req: Request, res: Response) {
      const id = getAndParseUuidParam(req, res, 'id')
      if (!id) return

      const row = await db.secretaries.delete({
        where: { id },
      })

      if (!row) {
        res.status(400).send('secretary: resource not found\n')
        return
      }

      res.status(204).send('')
    },
  },
  servicesAvailable: {
    async getAll(req: Request, res: Response) {
      const rows = await db.specializations.findMany({
        orderBy: { name: 'asc' },
        include: {
          service_names: {},
        },
      })
      res.json(
        rows.map((row) => ({
          id: row.id,
          name: row.name,
          items: row.service_names.map((s) => ({ id: s.id, name: s.name })),
        })),
      )
    },
    async create(req: Request, res: Response) {
      const args = {
        name: req.body.name as string,
        specialization: req.body.specialization as string | undefined,
        specializationId: req.body.specializationId as string | undefined,
      }

      if (args.name.length === 0) {
        res.status(400).send('invalid argument: name: field is required\n')
        return
      }

      const exists = await db.service_names.findUnique({
        where: { name: args.name },
      })

      if (exists) {
        res.status(400).send('service_names.name: resource already exists\n')
        return
      }

      if (args.specialization) {
        res.send('TODO')
        return
      }

      if (!args.specializationId) {
        res.status(400).send('invalid argument: specializationId: field is required\n')
        return
      }

      const row = await db.service_names.create({
        data: {
          name: args.name,
          specialization_id: args.specializationId,
        },
      })

      res.json({ id: row.id })
    },
    async getById(req: Request, res: Response) {
      const id = getAndParseUuidParam(req, res, 'id')
      if (!id) return

      const row = await db.service_names.findUnique({
        where: { id },
        include: {
          specializations: {},
        },
      })

      if (!row) {
        res.status(400).send('service_names: resource not found\n')
        return
      }

      res.json({
        serviceName: row.name,
        serviceNameId: row.id,
        specialization: row.specializations.name,
        specializationId: row.specializations.id,
      })
    },
    async update(req: Request, res: Response) {
      const id = getAndParseUuidParam(req, res, 'id')
      if (!id) return

      const args = {
        name: req.body.name as string,
      }

      if (args.name.length === 0) {
        res.status(400).send('invalid argument: name: field is required\n')
        return
      }

      const row = await db.service_names.findUnique({
        where: { id },
      })

      if (!row) {
        res.status(400).send('service_names: resource not found\n')
        return
      }

      if (row.name === args.name) {
        res.json({ id: row.id })
        return
      }

      const exists = await db.service_names.findUnique({
        where: { name: args.name },
      })

      if (exists) {
        res.status(400).send('service_names.name: resource already exists\n')
        return
      }

      await db.service_names.update({
        where: { id },
        data: { name: args.name },
      })

      res.json({ id: row.id })
    },
    async delete(req: Request, res: Response) {
      const id = getAndParseUuidParam(req, res, 'id')
      if (!id) return

      const row = await db.service_names.delete({
        where: { id },
      })

      if (!row) {
        res.status(400).send('service_names: resource not found\n')
        return
      }

      res.status(204).send('')
    },
  },
  services: {
    async getAll(req: Request, res: Response) {
      res.send('OK')
    },
    async create(req: Request, res: Response) {
      res.send('OK')
    },
    async count(req: Request, res: Response) {
      const count = await db.services.count({})
      res.send(count)
    },
    async getById(req: Request, res: Response) {
      res.send('OK')
    },
    async update(req: Request, res: Response) {
      res.send('OK')
    },
    async delete(req: Request, res: Response) {
      res.send('OK')
    },
  },
  specialists: {
    async getAll(req: Request, res: Response) {
      const rows = await db.specialists.findMany({
        orderBy: { name: 'asc' },
      })
      res.json(rows)
    },
    async create(req: Request, res: Response) {
      res.send('OK')
    },
    async count(req: Request, res: Response) {
      const count = await db.specialists.count({})
      res.send(count)
    },
    async getById(req: Request, res: Response) {
      res.send('OK')
    },
    async update(req: Request, res: Response) {
      res.send('OK')
    },
    async delete(req: Request, res: Response) {
      const id = getAndParseUuidParam(req, res, 'id')
      if (!id) return

      const row = await db.specialists.delete({
        where: { id },
      })

      if (!row) {
        res.status(400).send('specialist: resource not found\n')
        return
      }

      res.status(204).send('')
    },
  },
  specializations: {
    async getAll(req: Request, res: Response) {
      const rows = await db.specializations.findMany({
        orderBy: { name: 'asc' },
      })
      res.json(rows)
    },
    async create(req: Request, res: Response) {
      const args = {
        name: req.body.name.trim() as string,
      }

      if (args.name.length === 0) {
        res.status(400).send('invalid argument: name: field is required\n')
        return
      }

      const exists = await db.specializations.findUnique({
        where: { name: args.name },
      })

      if (exists) {
        res.status(400).send('specialization.name: resource already exists\n')
        return
      }

      const row = await db.specializations.create({
        data: {
          name: args.name,
        },
      })

      res.json({ id: row.id })
    },
    async update(req: Request, res: Response) {
      const id = getAndParseUuidParam(req, res, 'id')
      if (!id) return

      const args = {
        name: (req.body.name as string | undefined)?.trim(),
      }

      if (!args.name || args.name.length === 0) {
        res.status(400).send('invalid argument: name: field is required\n')
        return
      }

      const row = await db.specializations.update({
        where: { id },
        data: { name: args.name },
      })

      if (!row) {
        res.status(400).send('specialization: resource not found\n')
        return
      }

      res.json({ id: row.id })
    },
    async delete(req: Request, res: Response) {
      const id = getAndParseUuidParam(req, res, 'id')
      if (!id) return

      const row = await db.specializations.delete({
        where: { id },
      })

      if (!row) {
        res.status(400).send('specialization: resource not found\n')
        return
      }

      res.status(204).send('')
    },
  },
  test: {
    async init(req: Request, res: Response) {
      await db.$transaction(async (tx) => {
        await tx.admins.deleteMany()
        await tx.appointments.deleteMany()
        await tx.customers.deleteMany()
        await tx.secretaries.deleteMany()
        await tx.services.deleteMany()
        await tx.service_names.deleteMany()
        await tx.specialists.deleteMany()
        await tx.specialist_hours.deleteMany()
        await tx.specializations.deleteMany()

        await tx.admins.create({
          data: {
            name: 'Admin Test',
            email: 'admin@test.com',
            password: await hashPassword('123mudar'),
          },
        })
      })
      res.send('System initialized to be tested')
    },
    async stats(req: Request, res: Response) {
      const dbConfig = getDatabaseConfig()
      res.json({
        database: `user=${dbConfig.user} password=${dbConfig.password} host=${dbConfig.host} port=${dbConfig.port} dbname=${dbConfig.name}`,
        message: 'Environment: TEST',
      })
    },
    async debugClaims(req: Request, res: Response) {
      res.send('OK')
    },
  },
}
