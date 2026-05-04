import { type Request, type Response } from 'express'
import { db } from './db'
import { getAppConfig, getDatabaseConfig, listConfiguredResources } from './config'
import { extractJwtData, generateAccessJWT, generateRefreshJWT, isRefreshToken, JwtData, verifyJWT } from './jwt'
import {
  generateId,
  getAccessTokenFromRequest,
  getDateParam,
  getIntParam,
  getJwtDataFromRequest,
  getStringParam,
  hashPassword,
  parseUuid,
  replier,
  verifyPassword,
} from './utils'
import { validations } from './validations'
import { getDatePart, getTimePart, presenter } from './presenter'
import { errors } from './errors'
import * as types from './swagger-types'

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

export default {
  health: {
    async healthCheck(req: Request, res: Response) {
      const reply = replier<types.api.health.healthCheck.responses>(res)

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
      return reply.send(200, response)
    },
  },
  auth: {
    async login(req: Request, res: Response) {
      const reply = replier<types.api.auth.login.responses>(res)

      const appConfig = getAppConfig()

      const validEnvironemnts: Array<typeof appConfig.environemnt> = ['development', 'test']
      let accessTokenExpireIn = 0
      let refreshTokenExpireIn = 0
      if (validEnvironemnts.includes(appConfig.environemnt)) {
        accessTokenExpireIn = getIntParam(req.header('x-access-token-expires-in'), 0)
        refreshTokenExpireIn = getIntParam(req.header('x-refresh-token-expires-in'), 0)
      }

      // Collect query parameters, path parameters, and request body
      if (!validations.auth.login.body(req.body)) {
        return reply.fail(errors.ajv(validations.auth.login.body.errors![0]))
      }
      const args: types.api.auth.login.body = req.body

      // Validate e execute the usecase
      const identity = await getIdentity({ email: args.email })
      if (!identity) {
        return reply.fail(errors.invalidCredentials())
      }

      const validPassword = await verifyPassword(args.password, identity.password)
      if (!validPassword) {
        return reply.fail(errors.invalidCredentials())
      }

      const data = new JwtData(identity.id, identity.role)
      const accessToken = generateAccessJWT(data, accessTokenExpireIn)
      const refreshToken = generateRefreshJWT(data, refreshTokenExpireIn)

      // Format the response
      return reply.send(200, { accessToken, refreshToken })
    },
    async refresh(req: Request, res: Response) {
      const reply = replier<types.api.auth.refresh.responses>(res)

      // Collect query parameters, path parameters, and request body
      const refreshToken = getAccessTokenFromRequest(req)
      if (!refreshToken) {
        return reply.fail(errors.invalidToken())
      }

      const jwtData = await verifyJWT(refreshToken)
        .then(extractJwtData)
        .catch(() => null)
      if (!jwtData || !isRefreshToken(jwtData)) {
        return reply.fail(errors.invalidToken())
      }

      const id = parseUuid(jwtData.userId)
      if (!id) {
        console.error('jwt userId is not an uuid')
        return reply.fail(errors.internal('JWT userId is not an uuid'))
      }

      // Validate e execute the usecase
      const identity = await getIdentity({ id })
      if (!identity) {
        console.error('jwt userId without identity:', id)
        return reply.fail(errors.internal('JWT userId without identity'))
      }

      const data = new JwtData(identity.id, identity.role)
      const accessToken = generateAccessJWT(data)

      // Format the response
      return reply.send(200, { accessToken, refreshToken })
    },
    async me(req: Request, res: Response) {
      const reply = replier<types.api.auth.me.responses>(res)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      // Validate e execute the usecase
      const identity = await getIdentity({ id: jwtData.userId })
      if (!identity) {
        console.error('jwt userId without identity:', jwtData.userId)
        return reply.fail(errors.invalidToken())
      }

      // Format the response
      return reply.send(200, {
        id: identity.id,
        name: identity.name,
        email: identity.email,
        role: identity.role as any,
      })
    },
  },
  appointments: {
    async listAppointments(req: Request, res: Response) {
      const reply = replier<types.api.appointments.listAppointments.responses>(res)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const query: types.api.appointments.listAppointments.query = req.query
      const page = getIntParam(query.page, 0)
      const pageSize = getIntParam(query.pageSize, 10)
      const startDate = getDateParam(query.startDate)
      const endDate = getDateParam(query.endDate)
      const serviceName = getStringParam(query.serviceName)
      const specialist = getStringParam(query.specialist)
      const customer = getStringParam(query.customer)

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
      return reply.send(
        200,
        rows.map((row) => presenter.appointment(row)),
      )
    },
    async createAppointment(req: Request, res: Response) {
      const reply = replier<types.api.appointments.createAppointment.responses>(res)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      if (!validations.appointments.createAppointment.body(req.body)) {
        return reply.fail(errors.ajv(validations.appointments.createAppointment.body.errors![0]))
      }
      const args: types.api.appointments.createAppointment.body = req.body

      // Validate e execute the usecase
      const service = await db.services.findUnique({
        where: { id: args.serviceId },
      })

      if (!service) {
        return reply.fail(errors.notFound('service'))
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

      // Format the response
      return reply.send(201, { id: row.id })
    },
    async countAppointments(req: Request, res: Response) {
      const reply = replier<types.api.appointments.countAppointments.responses>(res)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const query: types.api.appointments.countAppointments.query = req.query
      const startDate = getDateParam(query.startDate)
      const endDate = getDateParam(query.endDate)
      const serviceName = getStringParam(query.serviceName)
      const specialist = getStringParam(query.specialist)
      const customer = getStringParam(query.customer)

      // Validate e execute the usecase
      const count = await db.appointments.count({
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
      })

      // Format the response
      return reply.send(200, count)
    },
    async getAppointmentsCalendar(req: Request, res: Response) {
      const reply = replier<types.api.appointments.getAppointmentsCalendar.responses>(res)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const query: types.api.appointments.getAppointmentsCalendar.query = req.query
      const startDate = getDateParam(query.startDate)
      if (!startDate) {
        return reply.fail(errors.validation('query', 'startDate', 'invalid date format'))
      }
      const endDate = getDateParam(query.endDate)
      if (!endDate) {
        return reply.fail(errors.validation('query', 'endDate', 'invalid date format'))
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
      return reply.send(
        200,
        row.map((row) => ({
          id: row.id,
          date: getDatePart(row.date.toISOString()),
          time: getTimePart(row.time.toISOString()),
          specialistName: row.specialist_name,
          status: row.status,
        })),
      )
    },
    async getAppointmentsCalendarCount(req: Request, res: Response) {
      const reply = replier<types.api.appointments.getAppointmentsCalendarCount.responses>(res)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const query: types.api.appointments.getAppointmentsCalendarCount.query = req.query
      const startDate = getDateParam(query.startDate)
      if (!startDate) {
        return reply.fail(errors.validation('query', 'startDate', 'invalid date format'))
      }
      const endDate = getDateParam(query.endDate)
      if (!endDate) {
        return reply.fail(errors.validation('query', 'endDate', 'invalid date format'))
      }

      type CountByStatus = { month: number; status: number; count: number }

      // Validate e execute the usecase
      // const appointmentsCount = await db.appointments.groupBy({
      //   where: {
      //     AND: [
      //       { date: { gt: startDate } }, //
      //       { date: { lt: endDate } }, //
      //     ],
      //   },
      //   by: ['date', 'status'],
      //   _count: { status: true },
      // })
      const appointmentsCount = await db.$queryRaw<CountByStatus[]>`
SELECT date_part('month', "a"."date")::int AS "month"
     , "status", COUNT("a"."id")::int AS "count"
FROM "appointments" "a"
WHERE "a"."date" >= ${startDate}
  AND "a"."date" <= ${endDate}
GROUP BY "month", "status"
ORDER BY "month" ASC;`

      // Format the response
      const response: types.schemas.AppointmentCalendarCount[] = Array.from({ length: 12 }, (_, month) => ({
        month,
        pendingCount: 0,
        realizedCount: 0,
        canceledCount: 0,
      }))

      appointmentsCount.forEach((countByStatus) => {
        switch (countByStatus.status) {
          case AppointmentStatus.Pending: {
            response[countByStatus.month - 1].pendingCount += countByStatus.count
            break
          }
          case AppointmentStatus.Realized: {
            response[countByStatus.month - 1].realizedCount += countByStatus.count
            break
          }
          case AppointmentStatus.Canceled: {
            response[countByStatus.month - 1].canceledCount += countByStatus.count
            break
          }
        }
      })

      return reply.send(200, response)
    },
    async getAppointmentById(req: Request, res: Response) {
      const reply = replier<types.api.appointments.getAppointmentById.responses>(res)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const id = parseUuid(req.params.id)
      if (!id) {
        return reply.fail(errors.validation('path', 'id', 'invalid uuid'))
      }

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
        return reply.fail(errors.notFound('appointment'))
      }

      // Format the response
      return reply.send(200, presenter.appointment(row))
    },
    async updateAppointment(req: Request, res: Response) {
      const reply = replier<types.api.appointments.updateAppointment.responses>(res)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const id = parseUuid(req.params.id)
      if (!id) {
        return reply.fail(errors.validation('path', 'id', 'invalid uuid'))
      }

      if (!validations.appointments.updateAppointment.body(req.body)) {
        return reply.fail(errors.ajv(validations.appointments.updateAppointment.body.errors![0]))
      }
      const args: types.api.appointments.updateAppointment.body = req.body

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
      return reply.send(200, { id: row.id })
    },
    async deleteAppointment(req: Request, res: Response) {
      const reply = replier<types.api.appointments.deleteAppointment.responses>(res)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const id = parseUuid(req.params.id)
      if (!id) {
        return reply.fail(errors.validation('path', 'id', 'invalid uuid'))
      }

      // Validate e execute the usecase
      const row = await db.appointments.delete({
        where: { id },
      })

      if (!row) {
        return reply.fail(errors.notFound('appointment'))
      }

      // Format the response
      return reply.send(204, '')
    },
  },
  customers: {
    async listCustomers(req: Request, res: Response) {
      const reply = replier<types.api.customers.listCustomers.responses>(res)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const query: types.api.customers.listCustomers.query = req.query
      const page = getIntParam(query.page, 0)
      const pageSize = getIntParam(query.pageSize, 10)
      const name = getStringParam(query.name, '')
      const cpf = getStringParam(query.cpf, '')
      const phone = getStringParam(query.phone, '')

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
      return reply.send(
        200,
        rows.map((row) => presenter.customer(row)),
      )
    },
    async createCustomer(req: Request, res: Response) {
      const reply = replier<types.api.customers.createCustomer.responses>(res)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      if (!validations.customers.createCustomer.body(req.body)) {
        return reply.fail(errors.ajv(validations.customers.createCustomer.body.errors![0]))
      }
      const args: types.api.customers.createCustomer.body = req.body

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
      return reply.send(201, { id: row.id })
    },
    async countCustomers(req: Request, res: Response) {
      const reply = replier<types.api.customers.countCustomers.responses>(res)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const query: types.api.customers.countCustomers.query = req.query
      const name = getStringParam(query.name, '')
      const cpf = getStringParam(query.cpf, '')
      const phone = getStringParam(query.phone, '')

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
      return reply.send(200, count)
    },
    async getCustomerById(req: Request, res: Response) {
      const reply = replier<types.api.customers.getCustomerById.responses>(res)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const id = parseUuid(req.params.id)
      if (!id) {
        return reply.fail(errors.validation('path', 'id', 'invalid uuid'))
      }

      // Validate e execute the usecase
      const row = await db.customers.findFirst({
        where: { id },
      })

      if (!row) {
        return reply.fail(errors.notFound('customer'))
      }

      // Format the response
      return reply.send(200, presenter.customer(row))
    },
    async updateCustomer(req: Request, res: Response) {
      const reply = replier<types.api.customers.updateCustomer.responses>(res)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const id = parseUuid(req.params.id)
      if (!id) {
        return reply.fail(errors.validation('path', 'id', 'invalid uuid'))
      }

      if (!validations.customers.updateCustomer.body(req.body)) {
        return reply.fail(errors.ajv(validations.customers.updateCustomer.body.errors![0]))
      }
      const args: types.api.customers.updateCustomer.body = req.body

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
      return reply.send(200, { id: row.id })
    },
    async deleteCustomer(req: Request, res: Response) {
      const reply = replier<types.api.customers.deleteCustomer.responses>(res)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const id = parseUuid(req.params.id)
      if (!id) {
        return reply.fail(errors.validation('path', 'id', 'invalid uuid'))
      }

      // Validate e execute the usecase
      const row = await db.customers.delete({
        where: { id },
      })

      if (!row) {
        return reply.fail(errors.notFound('customer'))
      }

      // Format the response
      return reply.send(204, '')
    },
  },
  secretaries: {
    async listSecretaries(req: Request, res: Response) {
      const reply = replier<types.api.secretaries.listSecretaries.responses>(res)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }
      if (!jwtData.hasAccess()) {
        return reply.fail(errors.invalidAccess('Role without access'))
      }

      const query: types.api.secretaries.listSecretaries.query = req.query
      const page = getIntParam(query.page, 0)
      const pageSize = getIntParam(query.pageSize, 10)
      const name = getStringParam(query.name, '')
      const cpf = getStringParam(query.cpf, '')
      const cnpj = getStringParam(query.cnpj, '')
      const phone = getStringParam(query.phone, '')

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
      return reply.send(
        200,
        rows.map((row) => presenter.secretary(row)),
      )
    },
    async createSecretary(req: Request, res: Response) {
      const reply = replier<types.api.secretaries.createSecretary.responses>(res)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }
      if (!jwtData.hasAccess()) {
        return reply.fail(errors.invalidAccess('Role without access'))
      }

      if (!validations.secretaries.createSecretary.body(req.body)) {
        return reply.fail(errors.ajv(validations.secretaries.createSecretary.body.errors![0]))
      }
      const args: types.api.secretaries.createSecretary.body = req.body

      // Validate e execute the usecase
      const exists = await db.secretaries.findUnique({
        where: { email: args.email },
      })

      if (exists) {
        return reply.fail(errors.alreadyExists('secretary', 'email'))
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
      return reply.send(201, { id: row.id })
    },
    async countSecretaries(req: Request, res: Response) {
      const reply = replier<types.api.secretaries.countSecretaries.responses>(res)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }
      if (!jwtData.hasAccess()) {
        return reply.fail(errors.invalidAccess('Role without access'))
      }

      const query: types.api.secretaries.countSecretaries.query = req.query
      const name = getStringParam(query.name, '')
      const cpf = getStringParam(query.cpf, '')
      const cnpj = getStringParam(query.cnpj, '')
      const phone = getStringParam(query.phone, '')

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
      return reply.send(200, count)
    },
    async getSecretaryById(req: Request, res: Response) {
      const reply = replier<types.api.secretaries.getSecretaryById.responses>(res)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }
      if (!jwtData.hasAccess('secretary')) {
        return reply.fail(errors.invalidAccess('Role without access'))
      }

      const id = parseUuid(req.params.id)
      if (!id) {
        return reply.fail(errors.validation('path', 'id', 'invalid uuid'))
      }
      if (jwtData.role === 'secretary' && jwtData.userId !== id) {
        return reply.fail(errors.invalidAccess('User without access'))
      }

      // Validate e execute the usecase
      const row = await db.secretaries.findFirst({
        where: { id },
      })

      if (!row) {
        return reply.fail(errors.notFound('secretary'))
      }

      // Format the response
      return reply.send(200, presenter.secretary(row))
    },
    async updateSecretary(req: Request, res: Response) {
      const reply = replier<types.api.secretaries.updateSecretary.responses>(res)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }
      if (!jwtData.hasAccess("secretary")) {
        return reply.fail(errors.invalidAccess('Role without access'))
      }

      const id = parseUuid(req.params.id)
      if (!id) {
        return reply.fail(errors.validation('path', 'id', 'invalid uuid'))
      }
      if (jwtData.role === 'secretary' && jwtData.userId !== id) {
        return reply.fail(errors.invalidAccess('User without access'))
      }

      if (!validations.secretaries.updateSecretary.body(req.body)) {
        return reply.fail(errors.ajv(validations.secretaries.updateSecretary.body.errors![0]))
      }
      const args: types.api.secretaries.updateSecretary.body = req.body

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
        return reply.fail(errors.notFound('secretary'))
      }

      if (row.email !== data.email) {
        const exists = await db.secretaries.findUnique({
          where: { email: data.email },
        })

        if (exists) {
          return reply.fail(errors.alreadyExists('secretary', 'email'))
        }
      }

      await db.secretaries.update({
        where: { id },
        data,
      })

      // Format the response
      return reply.send(200, { id: row.id })
    },
    async deleteSecretary(req: Request, res: Response) {
      const reply = replier<types.api.secretaries.deleteSecretary.responses>(res)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }
      if (!jwtData.hasAccess()) {
        return reply.fail(errors.invalidAccess('Role without access'))
      }

      const id = parseUuid(req.params.id)
      if (!id) {
        return reply.fail(errors.validation('path', 'id', 'invalid uuid'))
      }

      // Validate e execute the usecase
      const row = await db.secretaries.delete({
        where: { id },
      })

      if (!row) {
        return reply.fail(errors.notFound('secretary'))
      }

      // Format the response
      return reply.send(204, '')
    },
  },
  servicesAvailable: {
    async listServicesAvailable(req: Request, res: Response) {
      const reply = replier<types.api.servicesAvailable.listServicesAvailable.responses>(res)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const query: types.api.servicesAvailable.listServicesAvailable.query = req.query
      const page = getIntParam(query.page, 0)
      const pageSize = getIntParam(query.pageSize, 10)

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
      return reply.send(
        200,
        rows.map((row) => presenter.serviceGroup(row)),
      )
    },
    async createServiceAvailable(req: Request, res: Response) {
      const reply = replier<types.api.servicesAvailable.createServiceAvailable.responses>(res)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      if (!validations.servicesAvailable.createServiceAvailable.body(req.body)) {
        return reply.fail(errors.ajv(validations.servicesAvailable.createServiceAvailable.body.errors![0]))
      }
      const args: types.api.servicesAvailable.createServiceAvailable.body = req.body

      // Validate e execute the usecase
      const exists = await db.service_names.findUnique({
        where: { name: args.name },
      })

      if (exists) {
        return reply.fail(errors.alreadyExists('service_name', 'name'))
      }

      if (args.specialization) {
        throw new Error('TODO')
      }

      if (!args.specializationId) {
        return reply.fail(
          errors.validation('body', 'specializationId', "must have required property 'specializationId'"),
        )
      }

      const row = await db.service_names.create({
        data: {
          id: generateId(),
          name: args.name,
          specialization_id: args.specializationId,
        },
      })

      // Format the response
      return reply.send(201, { id: row.id })
    },
    async getServiceAvailableById(req: Request, res: Response) {
      const reply = replier<types.api.servicesAvailable.getServiceAvailableById.responses>(res)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const id = parseUuid(req.params.id)
      if (!id) {
        return reply.fail(errors.validation('path', 'id', 'invalid uuid'))
      }

      // Validate e execute the usecase
      const row = await db.service_names.findUnique({
        where: { id },
        include: {
          specializations: {},
        },
      })

      if (!row) {
        return reply.fail(errors.notFound('service_name'))
      }

      // Format the response
      return reply.send(200, {
        serviceName: row.name,
        serviceNameId: row.id,
        specialization: row.specializations.name,
        specializationId: row.specializations.id,
      })
    },
    async updateServiceAvailable(req: Request, res: Response) {
      const reply = replier<types.api.servicesAvailable.updateServiceAvailable.responses>(res)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const id = parseUuid(req.params.id)
      if (!id) {
        return reply.fail(errors.validation('path', 'id', 'invalid uuid'))
      }

      if (!validations.servicesAvailable.updateServiceAvailable.body(req.body)) {
        return reply.fail(errors.ajv(validations.servicesAvailable.updateServiceAvailable.body.errors![0]))
      }
      const args: types.api.servicesAvailable.updateServiceAvailable.body = req.body

      // Validate e execute the usecase
      const row = await db.service_names.findUnique({
        where: { id },
      })

      if (!row) {
        return reply.fail(errors.notFound('service_name'))
      }

      if (row.name === args.name) {
        return reply.send(200, { id: row.id })
      }

      const exists = await db.service_names.findUnique({
        where: { name: args.name },
      })

      if (exists) {
        return reply.fail(errors.notFound('service_name'))
      }

      await db.service_names.update({
        where: { id },
        data: { name: args.name },
      })

      // Format the response
      return reply.send(200, { id: row.id })
    },
    async deleteServiceAvailable(req: Request, res: Response) {
      const reply = replier<types.api.servicesAvailable.deleteServiceAvailable.responses>(res)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const id = parseUuid(req.params.id)
      if (!id) {
        return reply.fail(errors.validation('path', 'id', 'invalid uuid'))
      }

      // Validate e execute the usecase
      const row = await db.service_names.delete({
        where: { id },
      })

      if (!row) {
        return reply.fail(errors.notFound('service_name'))
      }

      // Format the response
      return reply.send(204, '')
    },
  },
  services: {
    async listServices(req: Request, res: Response) {
      const reply = replier<types.api.services.listServices.responses>(res)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const query: types.api.services.listServices.query = req.query
      const page = getIntParam(query.page, 0)
      const pageSize = getIntParam(query.pageSize, 10)
      const service = getStringParam(query.service).toLowerCase()
      const specialist = getStringParam(query.specialist).toLowerCase()
      const specialization = getStringParam(query.specialization).toLowerCase()

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
        // orderBy: [{ service_names: { specializations: { name: 'desc' } } }, { service_names: { name: 'desc' } }],
        take: pageSize,
        skip: page * pageSize,
      })

      // Format the response
      return reply.send(
        200,
        rows.map((row) => presenter.service(row)),
      )
    },
    async createService(req: Request, res: Response) {
      const reply = replier<types.api.services.createService.responses>(res)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      if (!validations.services.createService.body(req.body)) {
        return reply.fail(errors.ajv(validations.services.createService.body.errors![0]))
      }
      const args: types.api.services.createService.body = req.body

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
      return reply.send(201, { id: row.id })
    },
    async countServices(req: Request, res: Response) {
      const reply = replier<types.api.services.countServices.responses>(res)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const query: types.api.services.countServices.query = req.query
      const service = getStringParam(query.service).toLowerCase()
      const specialist = getStringParam(query.specialist).toLowerCase()
      const specialization = getStringParam(query.specialization).toLowerCase()

      // Validate e execute the usecase
      const count = await db.services.count({
        where: {
          AND: [
            ...(service ? [{ service_names: { name: { contains: service } } } as const] : []), //
            ...(specialist ? [{ specialists: { name: { contains: specialist } } } as const] : []), //
            ...(specialization
              ? [{ service_names: { specializations: { name: { contains: specialization } } } } as const]
              : []), //
          ],
        },
      })

      // Format the response
      return reply.send(200, count)
    },
    async getServiceById(req: Request, res: Response) {
      const reply = replier<types.api.services.getServiceById.responses>(res)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const id = parseUuid(req.params.id)
      if (!id) {
        return reply.fail(errors.validation('path', 'id', 'invalid uuid'))
      }

      // Validate e execute the usecase
      const row = await db.services.findUnique({
        where: { id },
      })

      if (!row) {
        return reply.fail(errors.notFound('service'))
      }

      // Format the response
      return reply.send(200, {
        id: row.id,
        specialistId: row.specialist_id,
        serviceNameId: row.service_name_id,
        price: row.price,
        duration: row.duration,
      })
    },
    async updateService(req: Request, res: Response) {
      const reply = replier<types.api.services.updateService.responses>(res)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const id = parseUuid(req.params.id)
      if (!id) {
        return reply.fail(errors.validation('path', 'id', 'invalid uuid'))
      }

      if (!validations.services.updateService.body(req.body)) {
        return reply.fail(errors.ajv(validations.services.updateService.body.errors![0]))
      }
      const args: types.api.services.updateService.body = req.body

      // Validate e execute the usecase
      const row = await db.services.update({
        where: { id },
        data: {
          duration: args.duration,
          price: args.price,
        },
      })

      if (!row) {
        return reply.fail(errors.notFound('service'))
      }

      // Format the response
      return reply.send(200, { id: row.id })
    },
    async deleteService(req: Request, res: Response) {
      const reply = replier<types.api.services.deleteService.responses>(res)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const id = parseUuid(req.params.id)
      if (!id) {
        return reply.fail(errors.validation('path', 'id', 'invalid uuid'))
      }

      // Validate e execute the usecase
      const row = await db.services.delete({
        where: { id },
      })

      if (!row) {
        return reply.fail(errors.notFound('service'))
      }

      // Format the response
      return reply.send(204, '')
    },
  },
  serviceGroups: {
    async listServiceGroups(req: Request, res: Response) {
      const reply = replier<types.api.serviceGroups.listServiceGroups.responses>(res)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      // Validate e execute the usecase
      const rows = await db.specializations.findMany({
        include: { service_names: {} },
      })

      // Format the response
      return reply.send(
        200,
        rows.map((row) => presenter.serviceGroup(row)),
      )
    },
  },
  specialists: {
    async listSpecialists(req: Request, res: Response) {
      const reply = replier<types.api.specialists.listSpecialists.responses>(res)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const query: types.api.specialists.listSpecialists.query = req.query
      const page = getIntParam(query.page, 0)
      const pageSize = getIntParam(query.pageSize, 10)
      const name = getStringParam(query.name)
      const cpf = getStringParam(query.cpf)
      const cnpj = getStringParam(query.cnpj)
      const phone = getStringParam(query.phone)

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
      return reply.send(
        200,
        rows.map((row) => presenter.specialist(row)),
      )
    },
    async createSpecialist(req: Request, res: Response) {
      const reply = replier<types.api.specialists.createSpecialist.responses>(res)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      if (!validations.specialists.createSpecialist.body(req.body)) {
        return reply.fail(errors.ajv(validations.specialists.createSpecialist.body.errors![0]))
      }
      const args: types.api.specialists.createSpecialist.body = req.body

      // Validate e execute the usecase
      const exists = await db.specialists.findUnique({
        where: { email: args.email },
      })

      if (exists) {
        return reply.fail(errors.alreadyExists('specialist', 'email'))
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
      return reply.send(201, { id: row.id })
    },
    async countSpecialists(req: Request, res: Response) {
      const reply = replier<types.api.specialists.countSpecialists.responses>(res)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const query: types.api.specialists.countSpecialists.query = req.query
      const name = getStringParam(query.name)
      const cpf = getStringParam(query.cpf)
      const cnpj = getStringParam(query.cnpj)
      const phone = getStringParam(query.phone)

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
      return reply.send(200, count)
    },
    async getSpecialistById(req: Request, res: Response) {
      const reply = replier<types.api.specialists.getSpecialistById.responses>(res)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const id = parseUuid(req.params.id)
      if (!id) {
        return reply.fail(errors.validation('path', 'id', 'invalid uuid'))
      }

      // Validate e execute the usecase
      const row = await db.specialists.findUnique({
        where: { id },
      })

      if (!row) {
        return reply.fail(errors.notFound('specialist'))
      }

      // Format the response
      return reply.send(200, presenter.specialist(row))
    },
    async getSpecialistServices(req: Request, res: Response) {
      const reply = replier<types.api.specialists.getSpecialistServices.responses>(res)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const id = parseUuid(req.params.id)
      if (!id) {
        return reply.fail(errors.validation('path', 'id', 'invalid uuid'))
      }

      // Validate e execute the usecase
      const rows = await db.services.findMany({
        where: { specialist_id: id },
        include: { service_names: {} },
      })

      // Format the response
      return reply.send(
        200,
        rows.map((row) => presenter.specialistService(row)),
      )
    },
    async getSpecialistSpecializations(req: Request, res: Response) {
      const reply = replier<types.api.specialists.getSpecialistSpecializations.responses>(res)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const id = parseUuid(req.params.id)
      if (!id) {
        return reply.fail(errors.validation('path', 'id', 'invalid uuid'))
      }

      // Validate e execute the usecase
      const rows = await db.specializations.findMany({
        where: { service_names: { some: { services: { some: { specialist_id: id } } } } },
      })

      // Format the response
      return reply.send(200, rows)
    },
    async getSpecialistAppointments(req: Request, res: Response) {
      const reply = replier<types.api.specialists.getSpecialistAppointments.responses>(res)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const id = parseUuid(req.params.id)
      if (!id) {
        return reply.fail(errors.validation('path', 'id', 'invalid uuid'))
      }

      const query: types.api.specialists.getSpecialistAppointments.query = req.query
      const page = getIntParam(query.page, 0)
      const pageSize = getIntParam(query.pageSize, 10)

      // Validate e execute the usecase
      const rows = await db.appointments.findMany({
        where: { specialist_id: id },
        include: { service_names: {}, customers: {} },
        take: pageSize,
        skip: page * pageSize,
      })

      // Format the response
      return reply.send(
        200,
        rows.map((row) => presenter.specialistAppointment(row)),
      )
    },
    async getSpecialistService(req: Request, res: Response) {
      const reply = replier<types.api.specialists.getSpecialistService.responses>(res)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const id = parseUuid(req.params.id)
      if (!id) {
        return reply.fail(errors.validation('path', 'id', 'invalid uuid'))
      }
      const serviceId = parseUuid(req.params.service_id)
      if (!serviceId) {
        return reply.fail(errors.validation('path', 'service_id', 'invalid uuid'))
      }

      // Validate e execute the usecase
      const row = await db.services.findFirst({
        where: { specialist_id: id, service_name_id: serviceId },
      })

      if (!row) {
        return reply.fail(errors.notFound('service'))
      }

      // Format the response
      return reply.send(200, {
        id: row.id,
        specialistId: row.specialist_id,
        serviceNameId: row.service_name_id,
        price: row.price,
        duration: row.duration,
      })
    },
    async updateSpecialist(req: Request, res: Response) {
      const reply = replier<types.api.specialists.updateSpecialist.responses>(res)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const id = parseUuid(req.params.id)
      if (!id) {
        return reply.fail(errors.validation('path', 'id', 'invalid uuid'))
      }

      if (!validations.specialists.updateSpecialist.body(req.body)) {
        return reply.fail(errors.ajv(validations.specialists.updateSpecialist.body.errors![0]))
      }
      const args: types.api.specialists.updateSpecialist.body = req.body

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
      return reply.send(200, { id: row.id })
    },
    async deleteSpecialist(req: Request, res: Response) {
      const reply = replier<types.api.specialists.deleteSpecialist.responses>(res)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const id = parseUuid(req.params.id)
      if (!id) {
        return reply.fail(errors.validation('path', 'id', 'invalid uuid'))
      }

      // Validate e execute the usecase
      const row = await db.specialists.delete({
        where: { id },
      })

      if (!row) {
        return reply.fail(errors.notFound('specialist'))
      }

      // Format the response
      return reply.send(204, '')
    },
  },
  specializations: {
    async listSpecializations(req: Request, res: Response) {
      const reply = replier<types.api.specializations.listSpecializations.responses>(res)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      // Validate e execute the usecase
      const rows = await db.specializations.findMany({
        orderBy: { name: 'asc' },
      })

      // Format the response
      return reply.send(200, rows)
    },
    async createSpecialization(req: Request, res: Response) {
      const reply = replier<types.api.specializations.createSpecialization.responses>(res)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      if (!validations.specializations.createSpecialization.body(req.body)) {
        return reply.fail(errors.ajv(validations.specializations.createSpecialization.body.errors![0]))
      }
      const args: types.api.specializations.createSpecialization.body = req.body

      // Validate e execute the usecase
      const exists = await db.specializations.findUnique({
        where: { name: args.name },
      })

      if (exists) {
        return reply.fail(errors.alreadyExists('specialization', 'name'))
      }

      const row = await db.specializations.create({
        data: {
          id: generateId(),
          name: args.name,
        },
      })

      // Format the response
      return reply.send(201, { id: row.id })
    },
    async updateSpecialization(req: Request, res: Response) {
      const reply = replier<types.api.specializations.updateSpecialization.responses>(res)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const id = parseUuid(req.params.id)
      if (!id) {
        return reply.fail(errors.validation('path', 'id', 'invalid uuid'))
      }

      if (!validations.specializations.updateSpecialization.body(req.body)) {
        return reply.fail(errors.ajv(validations.specializations.updateSpecialization.body.errors![0]))
      }
      const args: types.api.specializations.createSpecialization.body = req.body

      // Validate e execute the usecase
      const row = await db.specializations.update({
        where: { id },
        data: { name: args.name },
      })

      if (!row) {
        return reply.fail(errors.notFound('specialization'))
      }

      // Format the response
      return reply.send(200, { id: row.id })
    },
    async deleteSpecialization(req: Request, res: Response) {
      const reply = replier<types.api.specializations.deleteSpecialization.responses>(res)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const id = parseUuid(req.params.id)
      if (!id) {
        return reply.fail(errors.validation('path', 'id', 'invalid uuid'))
      }

      // Validate e execute the usecase
      const row = await db.specializations.delete({
        where: { id },
      })

      if (!row) {
        return reply.fail(errors.notFound('specialization'))
      }

      // Format the response
      return reply.send(204, '')
    },
  },
  test: {
    async initTest(req: Request, res: Response) {
      const reply = replier<types.api.test.initTest.responses>(res)

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
      return reply.send(200, 'System initialized to be tested')
    },
    async statsTest(req: Request, res: Response) {
      const reply = replier<types.api.test.statsTest.responses>(res)

      const dbConfig = getDatabaseConfig()
      return reply.send(200, {
        database: `user=${dbConfig.user} password=${dbConfig.password} host=${dbConfig.host} port=${dbConfig.port} dbname=${dbConfig.name}`,
        message: 'Environment: TEST',
      })
    },
    async debugClaimsTest(req: Request, res: Response) {
      const reply = replier<types.api.test.debugClaimsTest.responses>(res)

      return reply.send(200, 'OK')
    },
  },
}
