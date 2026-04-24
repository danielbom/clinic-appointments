import bcrypt from 'bcrypt'
import { type Request, type Response } from 'express'
import { db } from './db'
import { getAppConfig, getDatabaseConfig, listConfiguredResources } from './config'
import { validate as isUuid, v7 as generateId } from 'uuid'
import { generateAccessJWT, generateRefreshJWT, getJwtData, isRefreshToken, JwtData } from './jwt'
import { getDateParam, getIntParam, getStringParam } from './utils'
import * as types from './swagger-types'

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

function getTimePart(isodate: string): string {
  return isodate.slice(11, 19)
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

const AppointmentStatus = {
  None: 0,
  Pending: 1,
  Realized: 2,
  Canceled: 3,
}

const presenter = {
  appointment(
    row: Awaited<
      ReturnType<
        typeof db.appointments.findMany<{
          include: {
            customers: {}
            service_names: {}
            specialists: {}
          }
        }>
      >
    >[number],
  ): types.schemas.Appointment {
    return {
      id: row.id,
      customerName: row.customers.name,
      customerId: row.customer_id,
      serviceName: row.service_names.name,
      serviceNameId: row.service_names.id,
      specialistName: row.specialists.name,
      specialistId: row.specialists.id,
      price: row.price,
      duration: row.duration,
      date: getDatePart(row.date.toISOString()),
      time: getTimePart(row.time.toISOString()),
      status: row.status,
    }
  },
  specialistAppointment(
    row: Awaited<
      ReturnType<
        typeof db.appointments.findMany<{
          include: {
            customers: {}
            service_names: {}
          }
        }>
      >
    >[number],
  ): types.schemas.SpecialistAppointment {
    return {
      id: row.id,
      customerName: row.customers.name,
      customerId: row.customer_id,
      serviceName: row.service_names.name,
      serviceNameId: row.service_names.id,
      price: row.price,
      duration: row.duration,
      date: getDatePart(row.date.toISOString()),
      time: getTimePart(row.time.toISOString()),
      status: row.status,
    }
  },
  secretary(row: Awaited<ReturnType<typeof db.secretaries.findMany<{}>>>[number]): types.schemas.Secretary {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      birthdate: getDatePart(row.birthdate.toISOString()),
      cpf: row.cpf,
      cnpj: row.cnpj ?? undefined,
    }
  },
  customer(row: Awaited<ReturnType<typeof db.customers.findMany<{}>>>[number]): types.schemas.Customer {
    return {
      id: row.id,
      name: row.name,
      email: row.email ?? undefined,
      phone: row.phone,
      birthdate: getDatePart(row.birthdate.toISOString()),
      cpf: row.cpf,
    }
  },
  specialist(row: Awaited<ReturnType<typeof db.specialists.findMany<{}>>>[number]): types.schemas.Specialist {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      birthdate: getDatePart(row.birthdate.toISOString()),
      cpf: row.cpf,
      cnpj: row.cnpj ?? undefined,
    }
  },
  specialistService(
    row: Awaited<
      ReturnType<
        typeof db.services.findMany<{
          include: {
            service_names: {}
          }
        }>
      >
    >[number],
  ) {
    return {
      id: row.id,
      specializationId: row.service_names.specialization_id,
      serviceName: row.service_names.name,
      serviceNameId: row.service_name_id,
      price: row.price,
      duration: row.duration,
    }
  },
  service(
    row: Awaited<
      ReturnType<
        typeof db.services.findMany<{
          include: {
            service_names: { include: { specializations: {} } }
            specialists: {}
          }
        }>
      >
    >[number],
  ): types.schemas.ServiceEnriched {
    return {
      id: row.id,
      serviceName: row.service_names.name,
      serviceNameId: row.service_name_id,
      specialistName: row.specialists.name,
      specialistId: row.specialists.id,
      specialization: row.service_names.specializations.name,
      specializationId: row.service_names.specializations.id,
      price: row.price,
      duration: row.duration,
    }
  },
  serviceGroup(
    row: Awaited<ReturnType<typeof db.specializations.findMany<{ include: { service_names: {} } }>>>[number],
  ): types.schemas.ServiceGroup {
    return {
      id: row.id,
      name: row.name,
      items: row.service_names.map((s) => ({
        id: s.id,
        name: s.name,
      })),
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

      // Collect query parameters, path parameters, and request body
      const appConfig = getAppConfig()

      // Validate e execute the usecase
      const response: types.schemas.Status = {
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

      // Format the response
      res.json(response)
    },
  },
  auth: {
    async login(req: Request, res: Response) {
      // Collect query parameters, path parameters, and request body
      const args: types.body.AuthLogin = {
        email: req.body.email,
        password: req.body.password,
      }

      // Validate e execute the usecase
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

      // Format the response
      const response: types.schemas.AuthResponse = { accessToken, refreshToken }
      res.json(response)
    },
    async refresh(req: Request, res: Response) {
      // Collect query parameters, path parameters, and request body
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

      // Validate e execute the usecase
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

      // Format the response
      const response: types.schemas.AuthResponse = { accessToken, refreshToken }
      res.json(response)
    },
    async me(req: Request, res: Response) {
      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        res.status(400).send('invalid token\n')
        return
      }

      // Validate e execute the usecase
      const identity = await getIdentity({ id: jwtData.userId })
      if (!identity) {
        res.status(400).send('invalid token\n')
        return
      }

      // Format the response
      const response: types.schemas.AuthIdentity = {
        id: identity.id,
        name: identity.name,
        email: identity.email,
        role: identity.role,
      }
      res.json(response)
    },
  },
  appointments: {
    async listAppointments(req: Request, res: Response) {
      // Collect query parameters, path parameters, and request body
      const page = getIntParam(req.query.page, 0)
      const pageSize = getIntParam(req.query.pageSize, 10)
      const startDate = getDateParam(req.query.startDate)
      const endDate = getDateParam(req.query.endDate)
      const serviceName = getStringParam(req.query.serviceName)
      const specialist = getStringParam(req.query.specialist)
      const customer = getStringParam(req.query.customer)

      // Validate e execute the usecase
      const rows = await db.appointments.findMany({
        include: {
          customers: {},
          service_names: {},
          specialists: {},
        },
        where: {
          AND: [
            ...(startDate ? [{ date: { gte: startDate } }] : []),
            ...(endDate ? [{ date: { lte: endDate } }] : []),
            ...(serviceName
              ? [{ service_names: { name: { contains: serviceName, mode: 'insensitive' } } } as const]
              : []), //
            ...(specialist ? [{ specialists: { name: { contains: specialist, mode: 'insensitive' } } } as const] : []), //
            ...(customer ? [{ customers: { name: { contains: customer, mode: 'insensitive' } } } as const] : []), //
          ],
        },
        orderBy: [{ date: 'desc' }, { time: 'desc' }],
        take: pageSize,
        skip: page * pageSize,
      })

      // Format the response
      const response: types.schemas.Appointment[] = rows.map((row) => presenter.appointment(row))
      res.json(response)
    },
    async createAppointment(req: Request, res: Response) {
      const args: types.body.AppointmentsCreateBody = {
        customerId: req.body.customerId,
        date: req.body.date,
        serviceId: req.body.serviceId,
        time: req.body.time,
      }

      const service = await db.services.findUnique({
        where: { id: args.serviceId },
      })

      if (!service) {
        res.status(400).send('service: resource not found\n')
        return
      }

      const row = await db.appointments.create({
        data: {
          id: generateId(),
          date: new Date(args.date),
          time: new Date(`2020-01-02T${args.time}.000Z`),
          duration: service.duration,
          price: service.price,
          customer_id: args.customerId,
          service_name_id: service.service_name_id,
          specialist_id: service.specialist_id,
          status: AppointmentStatus.Pending,
        },
      })

      const response: types.schemas.Id = { id: row.id }
      res.json(response)
    },
    async countAppointments(req: Request, res: Response) {
      // Collect query parameters, path parameters, and request body

      // Validate e execute the usecase
      const count = await db.appointments.count({})

      // Format the response
      res.send(count)
    },
    async getAppointmentsCalendar(req: Request, res: Response) {
      // Collect query parameters, path parameters, and request body
      const startDate = getDateParam(req.query.startDate)
      if (!startDate) {
        return res.status(400).send('invalid date param: startDate\n')
      }
      const endDate = getDateParam(req.query.endDate)
      if (!endDate) {
        return res.status(400).send('invalid date param: endDate\n')
      }

      // Validate e execute the usecase

      // -- Just with client.previewFeatures = ["relationJoins"] enabled
      // const row = await dbLog.appointments.findMany({
      //   relationLoadStrategy: 'join',
      //   select: {
      //     id: true,
      //     date: true,
      //     time: true,
      //     status: true,
      //     specialists: { select: { name: true } },
      //   },
      //   where: {
      //     AND: [
      //       { date: { gt: startDate } }, //
      //       { date: { lt: endDate } }, //
      //     ],
      //   },
      //   orderBy: [{ date: 'desc' }, { time: 'desc' }],
      // })

      type CalendarRow = {
        id: string
        date: Date
        time: Date
        status: number
        specialist_name: string
      }
      const row = await db.$queryRaw<CalendarRow[]>`
SELECT "a"."id", "a"."date", "a"."time", "a"."status", "s"."name" AS "specialist_name"
FROM "appointments" "a"
JOIN "specialists" "s" ON "a"."specialist_id" = "s"."id"
WHERE "a"."date" >= ${startDate} AND "a"."date" <= ${endDate}
ORDER BY "a"."date" DESC, "a"."time" DESC
      `

      // Format the response
      const response: types.schemas.AppointmentCalendar[] = row.map((row) => ({
        id: row.id,
        date: getDatePart(row.date.toISOString()),
        time: getTimePart(row.time.toISOString()),
        specialistName: row.specialist_name,
        status: row.status,
      }))
      res.send(response)
    },
    async getAppointmentsCalendarCount(req: Request, res: Response) {
      // Collect query parameters, path parameters, and request body
      const startDate = getDateParam(req.query.startDate)
      if (!startDate) {
        return res.status(400).send('invalid date param: startDate\n')
      }
      const endDate = getDateParam(req.query.endDate)
      if (!endDate) {
        return res.status(400).send('invalid date param: endDate\n')
      }

      // Validate e execute the usecase
      const appointmentsCount = await db.appointments.groupBy({
        where: {
          AND: [
            { date: { gt: startDate } }, //
            { date: { lt: endDate } }, //
          ],
        },
        by: ['date', 'status'],
        _count: { status: true },
      })

      // Format the response
      const response: types.schemas.AppointmentCalendarCount[] = Array.from({ length: 12 }, (_, month) => ({
        month,
        pendingCount: 0,
        realizedCount: 0,
        canceledCount: 0,
      }))

      appointmentsCount.forEach((count) => {
        switch (count.status) {
          case AppointmentStatus.Pending: {
            response[count.date.getMonth()].pendingCount += count._count.status
            break
          }
          case AppointmentStatus.Realized: {
            response[count.date.getMonth()].realizedCount += count._count.status
            break
          }
          case AppointmentStatus.Canceled: {
            response[count.date.getMonth()].canceledCount += count._count.status
            break
          }
        }
      })

      res.send(response)
    },
    async getAppointmentById(req: Request, res: Response) {
      // Collect query parameters, path parameters, and request body
      const id = getAndParseUuidParam(req, res, 'id')
      if (!id) return

      // Validate e execute the usecase
      const row = await db.appointments.findFirst({
        include: {
          customers: {},
          service_names: {},
          specialists: {},
        },
        where: { id },
      })

      if (!row) {
        res.status(400).send('appointment: resource not found\n')
        return
      }

      // Format the response
      res.json(presenter.appointment(row))
    },
    async updateAppointment(req: Request, res: Response) {
      // Collect query parameters, path parameters, and request body
      const args: types.body.AppointmentsUpdateBody = {
        date: req.body.date,
        status: req.body.status,
        time: req.body.time,
      }

      const id = getAndParseUuidParam(req, res, 'id')
      if (!id) return

      // Validate e execute the usecase
      const row = await db.appointments.update({
        where: { id },
        data: {
          date: new Date(args.date),
          time: new Date(`2020-01-02T${args.time}.000Z`),
          status: args.status,
        },
      })

      // Format the response
      const response: types.schemas.Id = { id: row.id }
      res.json(response)
    },
    async deleteAppointment(req: Request, res: Response) {
      // Collect query parameters, path parameters, and request body
      const id = getAndParseUuidParam(req, res, 'id')
      if (!id) return

      // Validate e execute the usecase
      const row = await db.appointments.delete({
        where: { id },
      })

      if (!row) {
        res.status(400).send('appointment: resource not found\n')
        return
      }

      // Format the response
      res.status(204).send('')
    },
  },
  customers: {
    async listCustomers(req: Request, res: Response) {
      // Collect query parameters, path parameters, and request body
      const page = getIntParam(req.query.page, 0)
      const pageSize = getIntParam(req.query.pageSize, 10)
      const name = getStringParam(req.query.name, '')
      const cpf = getStringParam(req.query.cpf, '')
      const phone = getStringParam(req.query.phone, '')

      // Validate e execute the usecase
      const rows = await db.customers.findMany({
        where: {
          AND: [
            ...(name ? [{ name: { contains: name, mode: 'insensitive' } as const }] : []), //
            ...(cpf ? [{ cpf }] : []), //
            ...(phone ? [{ phone }] : []), //
          ],
        },
        // orderBy: { name: 'asc' },
        take: pageSize,
        skip: page * pageSize,
      })

      // Format the response
      const response = rows.map((row) => presenter.customer(row))
      res.json(response)
    },
    async createCustomer(req: Request, res: Response) {
      // Collect query parameters, path parameters, and request body
      const args: types.body.CustomerCreateBody = {
        birthdate: req.body.birthdate,
        cpf: req.body.cpf,
        email: req.body.email,
        name: req.body.name,
        phone: req.body.phone,
      }

      // Validate e execute the usecase
      const row = await db.customers.create({
        data: {
          id: generateId(),
          birthdate: new Date(args.birthdate),
          cpf: args.cpf,
          email: args.email,
          name: args.name,
          phone: args.phone,
        },
      })

      // Format the response
      const response: types.schemas.Id = { id: row.id }
      res.json(response)
    },
    async countCustomers(req: Request, res: Response) {
      // Collect query parameters, path parameters, and request body
      const name = getStringParam(req.query.name, '')
      const cpf = getStringParam(req.query.cpf, '')
      const phone = getStringParam(req.query.phone, '')

      // Validate e execute the usecase
      const count = await db.customers.count({
        where: {
          AND: [
            ...(name ? [{ name: { contains: name, mode: 'insensitive' } as const }] : []), //
            ...(cpf ? [{ cpf }] : []), //
            ...(phone ? [{ phone }] : []), //
          ],
        },
      })

      // Format the response
      res.send(count)
    },
    async getCustomerById(req: Request, res: Response) {
      // Collect query parameters, path parameters, and request body
      const id = getAndParseUuidParam(req, res, 'id')
      if (!id) return

      // Validate e execute the usecase
      const row = await db.customers.findFirst({
        where: { id },
      })

      if (!row) {
        res.status(400).send('customer: resource not found\n')
        return
      }

      // Format the response
      res.json(presenter.customer(row))
    },
    async updateCustomer(req: Request, res: Response) {
      // Collect query parameters, path parameters, and request body
      const args: types.body.CustomerUpdateBody = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        birthdate: req.body.birthdate,
        cpf: req.body.cpf,
      }

      const id = getAndParseUuidParam(req, res, 'id')
      if (!id) return

      const data = {
        name: args.name,
        email: args.email,
        phone: args.phone,
        birthdate: new Date(args.birthdate),
        cpf: args.cpf,
      }

      // Validate e execute the usecase
      const row = await db.customers.update({
        where: { id },
        data,
      })

      // Format the response
      const response: types.schemas.Id = { id: row.id }
      res.json(response)
    },
    async deleteCustomer(req: Request, res: Response) {
      // Collect query parameters, path parameters, and request body
      const id = getAndParseUuidParam(req, res, 'id')
      if (!id) return

      // Validate e execute the usecase
      const row = await db.customers.delete({
        where: { id },
      })

      if (!row) {
        res.status(400).send('customer: resource not found\n')
        return
      }

      // Format the response
      res.status(204).send('')
    },
  },
  secretaries: {
    async listSecretaries(req: Request, res: Response) {
      // Collect query parameters, path parameters, and request body
      const page = getIntParam(req.query.page, 0)
      const pageSize = getIntParam(req.query.pageSize, 10)
      const name = getStringParam(req.query.name, '')
      const cpf = getStringParam(req.query.cpf, '')
      const cnpj = getStringParam(req.query.cnpj, '')
      const phone = getStringParam(req.query.phone, '')

      // Validate e execute the usecase
      const rows = await db.secretaries.findMany({
        where: {
          AND: [
            ...(name ? [{ name: { contains: name, mode: 'insensitive' } as const }] : []), //
            ...(cpf ? [{ cpf }] : []), //
            ...(cnpj ? [{ cnpj }] : []), //
            ...(phone ? [{ phone }] : []), //
          ],
        },
        orderBy: { name: 'asc' },
        take: pageSize,
        skip: page * pageSize,
      })

      // Format the response
      const response = rows.map((row) => presenter.secretary(row))
      res.json(response)
    },
    async createSecretary(req: Request, res: Response) {
      // Collect query parameters, path parameters, and request body
      const args: types.body.SecretaryCreateBody = {
        birthdate: req.body.birthdate,
        cpf: req.body.cpf,
        email: req.body.email,
        name: req.body.name,
        password: req.body.password,
        phone: req.body.phone,
        cnpj: req.body.cnpj,
      }

      // Validate e execute the usecase
      const exists = await db.secretaries.findUnique({
        where: { email: args.email },
      })

      if (exists) {
        res.status(400).send('secretary.email: resource already exists\n')
        return
      }

      const row = await db.secretaries.create({
        data: {
          id: generateId(),
          birthdate: new Date(args.birthdate),
          cpf: args.cpf,
          email: args.email,
          name: args.name,
          password: await hashPassword(args.password),
          phone: args.phone,
          cnpj: args.cnpj,
        },
      })

      // Format the response
      const response: types.schemas.Id = { id: row.id }
      res.json(response)
    },
    async countSecretaries(req: Request, res: Response) {
      // Collect query parameters, path parameters, and request body
      const name = getStringParam(req.query.name, '')
      const cpf = getStringParam(req.query.cpf, '')
      const cnpj = getStringParam(req.query.cnpj, '')
      const phone = getStringParam(req.query.phone, '')

      // Validate e execute the usecase
      const count = await db.secretaries.count({
        where: {
          AND: [
            ...(name ? [{ name: { contains: name, mode: 'insensitive' } as const }] : []), //
            ...(cpf ? [{ cpf }] : []), //
            ...(cnpj ? [{ cnpj }] : []), //
            ...(phone ? [{ phone }] : []), //
          ],
        },
      })

      // Format the response
      res.send(count)
    },
    async getSecretaryById(req: Request, res: Response) {
      // Collect query parameters, path parameters, and request body
      const id = getAndParseUuidParam(req, res, 'id')
      if (!id) return

      // Validate e execute the usecase
      const row = await db.secretaries.findFirst({
        where: { id },
      })

      if (!row) {
        res.status(400).send('secretary: resource not found\n')
        return
      }

      // Format the response
      res.json(presenter.secretary(row))
    },
    async updateSecretary(req: Request, res: Response) {
      // Collect query parameters, path parameters, and request body
      const args: types.body.SecretaryUpdateBody = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        birthdate: req.body.birthdate,
        cpf: req.body.cpf,
        cnpj: req.body.cnpj,
        password: req.body.password,
      }

      const id = getAndParseUuidParam(req, res, 'id')
      if (!id) return

      const data = {
        name: args.name,
        email: args.email,
        phone: args.phone,
        birthdate: new Date(args.birthdate),
        cpf: args.cpf,
        cnpj: args.cnpj,
        password: args.password ? await hashPassword(args.password) : undefined,
      }

      // Validate e execute the usecase
      const row = await db.secretaries.findFirst({
        where: { id },
      })

      if (!row) {
        res.status(400).send('secretary: resource not found\n')
        return
      }

      if (row.email !== data.email) {
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

      // Format the response
      const response: types.schemas.Id = { id: row.id }
      res.json(response)
    },
    async deleteSecretary(req: Request, res: Response) {
      // Collect query parameters, path parameters, and request body
      const id = getAndParseUuidParam(req, res, 'id')
      if (!id) return

      // Validate e execute the usecase
      const row = await db.secretaries.delete({
        where: { id },
      })

      if (!row) {
        res.status(400).send('secretary: resource not found\n')
        return
      }

      // Format the response
      res.status(204).send('')
    },
  },
  servicesAvailable: {
    async listServicesAvailable(req: Request, res: Response) {
      // Collect query parameters, path parameters, and request body
      const page = getIntParam(req.query.page, 0)
      const pageSize = getIntParam(req.query.pageSize, 10)

      // Validate e execute the usecase
      const rows = await db.specializations.findMany({
        orderBy: { name: 'asc' },
        include: {
          service_names: {},
        },
        take: pageSize,
        skip: page * pageSize,
      })

      // Format the response
      const response: types.schemas.ServiceAvailable[] = rows.map((row) => ({
        id: row.id,
        name: row.name,
        items: row.service_names.map((s) => ({ id: s.id, name: s.name })),
      }))
      res.json(response)
    },
    async createServiceAvailable(req: Request, res: Response) {
      // Collect query parameters, path parameters, and request body
      const args: types.body.ServiceAvailableCreateBody = {
        name: req.body.name,
        specialization: req.body.specialization,
        specializationId: req.body.specializationId,
      }

      if (args.name.length === 0) {
        res.status(400).send('invalid argument: name: field is required\n')
        return
      }

      // Validate e execute the usecase
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
          id: generateId(),
          name: args.name,
          specialization_id: args.specializationId,
        },
      })

      // Format the response
      const response: types.schemas.Id = { id: row.id }
      res.json(response)
    },
    async getServiceAvailableById(req: Request, res: Response) {
      // Collect query parameters, path parameters, and request body
      const id = getAndParseUuidParam(req, res, 'id')
      if (!id) return

      // Validate e execute the usecase
      const row = await db.service_names.findUnique({
        where: { id },
        include: {
          specializations: {},
        },
      })

      if (!row) {
        res.status(400).send('service_name: resource not found\n')
        return
      }

      // Format the response
      res.json({
        serviceName: row.name,
        serviceNameId: row.id,
        specialization: row.specializations.name,
        specializationId: row.specializations.id,
      })
    },
    async updateServiceAvailable(req: Request, res: Response) {
      // Collect query parameters, path parameters, and request body
      const id = getAndParseUuidParam(req, res, 'id')
      if (!id) return

      const args: types.body.ServiceAvailableUpdateBody = {
        name: req.body.name,
      }

      if (args.name.length === 0) {
        res.status(400).send('invalid argument: name: field is required\n')
        return
      }

      // Validate e execute the usecase
      const row = await db.service_names.findUnique({
        where: { id },
      })

      if (!row) {
        res.status(400).send('service_name: resource not found\n')
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

      // Format the response
      const response: types.schemas.Id = { id: row.id }
      res.json(response)
    },
    async deleteServiceAvailable(req: Request, res: Response) {
      // Collect query parameters, path parameters, and request body
      const id = getAndParseUuidParam(req, res, 'id')
      if (!id) return

      // Validate e execute the usecase
      const row = await db.service_names.delete({
        where: { id },
      })

      if (!row) {
        res.status(400).send('service_name: resource not found\n')
        return
      }

      // Format the response
      res.status(204).send('')
    },
  },
  services: {
    async listServices(req: Request, res: Response) {
      // Collect query parameters, path parameters, and request body
      const page = getIntParam(req.query.page, 0)
      const pageSize = getIntParam(req.query.pageSize, 10)
      const service = getStringParam(req.query.service).toLowerCase()
      const specialist = getStringParam(req.query.specialist).toLowerCase()
      const specialization = getStringParam(req.query.specialization).toLowerCase()

      // Validate e execute the usecase
      const rows = await db.services.findMany({
        where: {
          AND: [
            ...(service ? [{ service_names: { name: { contains: service } } } as const] : []), //
            ...(specialist ? [{ specialists: { name: { contains: specialist } } } as const] : []), //
            ...(specialization
              ? [{ service_names: { specializations: { name: { contains: specialization } } } } as const]
              : []), //
          ],
        },
        include: { service_names: { include: { specializations: {} } }, specialists: {} },
        orderBy: [{ service_names: { specializations: { name: 'desc' } } }, { service_names: { name: 'desc' } }],
        take: pageSize,
        skip: page * pageSize,
      })

      // Format the response
      const response: types.schemas.ServiceEnriched[] = rows.map((row) => presenter.service(row))
      res.json(response)
    },
    async createService(req: Request, res: Response) {
      // Collect query parameters, path parameters, and request body
      const args: types.body.ServiceCreateBody = {
        duration: req.body.duration,
        price: req.body.price,
        serviceNameId: req.body.serviceNameId,
        specialistId: req.body.specialistId,
      }

      // Validate e execute the usecase
      const row = await db.services.create({
        data: {
          id: generateId(),
          service_name_id: args.serviceNameId,
          specialist_id: args.specialistId,
          price: args.price,
          duration: args.duration,
        },
      })

      // Format the response
      const response: types.schemas.Id = { id: row.id }
      res.json(response)
    },
    async countServices(req: Request, res: Response) {
      // Collect query parameters, path parameters, and request body

      // Validate e execute the usecase
      const count = await db.services.count({})

      // Format the response
      res.send(count)
    },
    async getServiceById(req: Request, res: Response) {
      // Collect query parameters, path parameters, and request body
      const id = getAndParseUuidParam(req, res, 'id')
      if (!id) return

      // Validate e execute the usecase
      const row = await db.services.findUnique({
        where: { id },
      })

      if (!row) {
        res.status(400).send('service: resource not found\n')
        return
      }

      // Format the response
      const response: types.schemas.Service = {
        id: row.id,
        specialistId: row.specialist_id,
        serviceNameId: row.service_name_id,
        price: row.price,
        duration: row.duration,
      }
      res.send(response)
    },
    async updateService(req: Request, res: Response) {
      // Collect query parameters, path parameters, and request body
      const id = getAndParseUuidParam(req, res, 'id')
      if (!id) return

      const args: types.body.ServiceUpdateBody = {
        duration: req.body.duration,
        price: req.body.price,
      }

      // Validate e execute the usecase
      const row = await db.services.update({
        where: { id },
        data: {
          duration: args.duration,
          price: args.price,
        },
      })

      if (!row) {
        res.status(400).send('service: resource not found\n')
        return
      }

      // Format the response
      const response: types.schemas.Id = { id: row.id }
      res.json(response)
    },
    async deleteService(req: Request, res: Response) {
      // Collect query parameters, path parameters, and request body
      const id = getAndParseUuidParam(req, res, 'id')
      if (!id) return

      // Validate e execute the usecase
      const row = await db.services.delete({
        where: { id },
      })

      if (!row) {
        res.status(400).send('service: resource not found\n')
        return
      }

      // Format the response
      res.status(204).send('')
    },
  },
  serviceGroups: {
    async listServiceGroups(req: Request, res: Response) {
      // Collect query parameters, path parameters, and request body

      // Validate e execute the usecase
      const rows = await db.specializations.findMany({
        include: { service_names: {} },
      })

      // Format the response
      const response: types.schemas.ServiceGroup[] = rows.map((row) => presenter.serviceGroup(row))
      res.json(response)
    },
  },
  specialists: {
    async listSpecialists(req: Request, res: Response) {
      // Collect query parameters, path parameters, and request body
      const page = getIntParam(req.query.page, 0)
      const pageSize = getIntParam(req.query.pageSize, 10)
      const name = getStringParam(req.query.name)
      const cpf = getStringParam(req.query.cpf)
      const cnpj = getStringParam(req.query.cnpj)
      const phone = getStringParam(req.query.phone)

      // Validate e execute the usecase
      const rows = await db.specialists.findMany({
        where: {
          AND: [
            ...(name ? [{ name: { contains: name, mode: 'insensitive' } as const }] : []), //
            ...(cpf ? [{ cpf }] : []), //
            ...(cnpj ? [{ cnpj }] : []), //
            ...(phone ? [{ phone }] : []), //
          ],
        },
        orderBy: { name: 'asc' },
        take: pageSize,
        skip: page * pageSize,
      })

      // Format the response
      const response: types.schemas.Specialist[] = rows.map((row) => presenter.specialist(row))
      res.json(response)
    },
    async createSpecialist(req: Request, res: Response) {
      // Collect query parameters, path parameters, and request body
      const args: types.body.SpecialistCreateBody = {
        name: req.body.name.trim(),
        birthdate: req.body.birthdate,
        cnpj: req.body.cnpj,
        cpf: req.body.cpf,
        email: req.body.email,
        phone: req.body.phone,
        services: req.body.services,
      }

      // Validate e execute the usecase
      const exists = await db.specialists.findUnique({
        where: { email: args.email },
      })

      if (exists) {
        res.status(400).send('specialist.email: resource already exists\n')
        return
      }

      const row = await db.$transaction(async (tx) => {
        const row = await tx.specialists.create({
          data: {
            id: generateId(),
            birthdate: new Date(args.birthdate),
            cpf: args.cpf,
            email: args.email,
            name: args.name,
            phone: args.phone,
            cnpj: args.cnpj,
          },
        })

        await tx.services.createMany({
          data: args.services.map((s) => ({
            id: generateId(),
            service_name_id: s.serviceNameId,
            price: s.price,
            duration: s.duration,
            specialist_id: row.id,
          })),
        })

        return row
      })

      // Format the response
      const response: types.schemas.Id = { id: row.id }
      res.json(response)
    },
    async countSpecialists(req: Request, res: Response) {
      // Collect query parameters, path parameters, and request body
      const name = getStringParam(req.query.name)
      const cpf = getStringParam(req.query.cpf)
      const cnpj = getStringParam(req.query.cnpj)
      const phone = getStringParam(req.query.phone)

      // Validate e execute the usecase
      const count = await db.specialists.count({
        where: {
          AND: [
            ...(name ? [{ name: { contains: name, mode: 'insensitive' } as const }] : []), //
            ...(cpf ? [{ cpf }] : []), //
            ...(cnpj ? [{ cnpj }] : []), //
            ...(phone ? [{ phone }] : []), //
          ],
        },
      })

      // Format the response
      res.send(count)
    },
    async getSpecialistById(req: Request, res: Response) {
      const id = getAndParseUuidParam(req, res, 'id')
      if (!id) return

      const row = await db.specialists.findUnique({
        where: { id },
      })

      if (!row) {
        res.status(400).send('specialist: resource not found\n')
        return
      }

      const response: types.schemas.Specialist = presenter.specialist(row)
      res.json(response)
    },
    async getSpecialistServices(req: Request, res: Response) {
      const id = getAndParseUuidParam(req, res, 'id')
      if (!id) return

      const rows = await db.services.findMany({
        where: { specialist_id: id },
        include: { service_names: {} },
      })

      const response = rows.map((row) => presenter.specialistService(row))
      res.json(response)
    },
    async getSpecialistSpecializations(req: Request, res: Response) {
      // Collect query parameters, path parameters, and request body
      const id = getAndParseUuidParam(req, res, 'id')
      if (!id) return

      // Validate e execute the usecase
      const rows = await db.specializations.findMany({
        where: { service_names: { some: { services: { some: { specialist_id: id } } } } },
      })

      // Format the response
      const response: types.schemas.Specialization[] = rows
      res.json(response)
    },
    async getSpecialistAppointments(req: Request, res: Response) {
      // Collect query parameters, path parameters, and request body
      const id = getAndParseUuidParam(req, res, 'id')
      if (!id) return

      // Validate e execute the usecase
      const rows = await db.appointments.findMany({
        where: { specialist_id: id },
        include: { service_names: {}, customers: {} },
      })

      // Format the response
      const response = rows.map((row) => presenter.specialistAppointment(row))
      res.json(response)
    },
    async getSpecialistService(req: Request, res: Response) {
      // Collect query parameters, path parameters, and request body
      const id = getAndParseUuidParam(req, res, 'id')
      if (!id) return
      const serviceId = getAndParseUuidParam(req, res, 'service_id')
      if (!serviceId) return

      // Validate e execute the usecase
      const row = await db.services.findFirst({
        where: { specialist_id: id, service_name_id: serviceId },
      })

      if (!row) {
        res.status(400).send('service: resource not found\n')
        return
      }

      // Format the response
      const response: types.schemas.Service = {
        id: row.id,
        specialistId: row.specialist_id,
        serviceNameId: row.service_name_id,
        price: row.price,
        duration: row.duration,
      }
      res.json(response)
    },
    async updateSpecialist(req: Request, res: Response) {
      // Collect query parameters, path parameters, and request body
      const id = getAndParseUuidParam(req, res, 'id')
      if (!id) return

      const args: types.body.SpecialistUpdateBody = {
        name: req.body.name.trim(),
        birthdate: req.body.birthdate,
        cnpj: req.body.cnpj,
        cpf: req.body.cpf,
        email: req.body.email,
        phone: req.body.phone,
        services: req.body.services,
      }

      if (args.name.length === 0) {
        res.status(400).send('invalid argument: name: field is required\n')
        return
      }

      // Validate e execute the usecase
      const row = await db.specialists.update({
        where: { id },
        data: {
          birthdate: new Date(args.birthdate),
          cpf: args.cpf,
          email: args.email,
          name: args.name,
          phone: args.phone,
          cnpj: args.cnpj,
        },
      })

      // Format the response
      const response: types.schemas.Id = { id: row.id }
      res.json(response)
    },
    async deleteSpecialist(req: Request, res: Response) {
      // Collect query parameters, path parameters, and request body
      const id = getAndParseUuidParam(req, res, 'id')
      if (!id) return

      // Validate e execute the usecase
      const row = await db.specialists.delete({
        where: { id },
      })

      if (!row) {
        res.status(400).send('specialist: resource not found\n')
        return
      }

      // Format the response
      res.status(204).send('')
    },
  },
  specializations: {
    async listSpecializations(req: Request, res: Response) {
      // Collect query parameters, path parameters, and request body

      // Validate e execute the usecase
      const rows = await db.specializations.findMany({
        orderBy: { name: 'asc' },
      })

      // Format the response
      res.json(rows)
    },
    async createSpecialization(req: Request, res: Response) {
      // Collect query parameters, path parameters, and request body
      const args: types.body.SpecializationCreateBody = {
        name: req.body.name?.trim(),
      }

      if (!args.name) {
        res.status(400).send('invalid argument: name: field is required\n')
        return
      }

      // Validate e execute the usecase
      const exists = await db.specializations.findUnique({
        where: { name: args.name },
      })

      if (exists) {
        res.status(400).send('specialization.name: resource already exists\n')
        return
      }

      const row = await db.specializations.create({
        data: {
          id: generateId(),
          name: args.name,
        },
      })

      // Format the response
      const response: types.schemas.Id = { id: row.id }
      res.json(response)
    },
    async updateSpecialization(req: Request, res: Response) {
      // Collect query parameters, path parameters, and request body
      const id = getAndParseUuidParam(req, res, 'id')
      if (!id) return

      const args: types.body.SpecializationUpdateBody = {
        name: req.body.name?.trim(),
      }

      if (!args.name) {
        res.status(400).send('invalid argument: name: field is required\n')
        return
      }

      // Validate e execute the usecase
      const row = await db.specializations.update({
        where: { id },
        data: { name: args.name },
      })

      if (!row) {
        res.status(400).send('specialization: resource not found\n')
        return
      }

      // Format the response
      const response: types.schemas.Id = { id: row.id }
      res.json(response)
    },
    async deleteSpecialization(req: Request, res: Response) {
      // Collect query parameters, path parameters, and request body
      const id = getAndParseUuidParam(req, res, 'id')
      if (!id) return

      // Validate e execute the usecase
      const row = await db.specializations.delete({
        where: { id },
      })

      if (!row) {
        res.status(400).send('specialization: resource not found\n')
        return
      }

      // Format the response
      res.status(204).send('')
    },
  },
  test: {
    async initTest(req: Request, res: Response) {
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
            id: generateId(),
            name: 'Admin Test',
            email: 'admin@test.com',
            password: await hashPassword('123mudar'),
          },
        })
      })
      res.send('System initialized to be tested')
    },
    async statsTest(req: Request, res: Response) {
      const dbConfig = getDatabaseConfig()
      res.json({
        database: `user=${dbConfig.user} password=${dbConfig.password} host=${dbConfig.host} port=${dbConfig.port} dbname=${dbConfig.name}`,
        message: 'Environment: TEST',
      })
    },
    async debugClaimsTest(req: Request, res: Response) {
      res.send('OK')
    },
  },
}
