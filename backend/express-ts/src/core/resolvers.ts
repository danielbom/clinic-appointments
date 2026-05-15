import type * as types from './swagger-types'
import * as queries from './queries'
import * as mutations from './mutations'
import { getAppConfig, getDatabaseConfig, listConfiguredResources } from './config'
import { replier, type RequestAdapter, type Resolver, type ResponseAdapter } from '../lib/http-adapter'
import { getAccessTokenFromRequest, getDateParam, getIntParam, getJwtDataFromRequest, getStringParam } from './utils'
import { validations } from './validations'
import { errors } from './errors'
import { presenter } from './presenter'
import { parseUuid } from '../id'

type Errors =
  | { error: mutations.NotFoundError; response: types.errors.NotFoundProblemDetails }
  | { error: mutations.AlreadyExistsError; response: types.errors.ConflictProblemDetails }
  | { error: mutations.ScheduleConflictError; response: types.errors.ConflictProblemDetails }
  | { error: mutations.InvalidCredentialsError; response: types.errors.AuthProblemDetails }
  | { error: mutations.InvalidTokenError; response: types.errors.AuthProblemDetails }
  | { error: mutations.InternalError; response: types.errors.InternalProblemDetails }

type ErrorsMap = {
  'not found': types.errors.NotFoundProblemDetails
  'already exists': types.errors.ConflictProblemDetails
  'schedule conflict': types.errors.ConflictProblemDetails
  'invalid credentials': types.errors.AuthProblemDetails
  'invalid token': types.errors.AuthProblemDetails
  'internal': types.errors.AuthProblemDetails
}

function mapError<TError extends Errors['error'], K extends TError['kind']>(error: TError): ErrorsMap[K] {
  switch (error.kind) {
    case 'not found':
      return errors.notFound(error.resource) as ErrorsMap[K]
    case 'already exists':
      return errors.alreadyExists(error.resource, error.key) as ErrorsMap[K]
    case 'schedule conflict':
      return errors.scheduleConflict(error.resource, error.key) as ErrorsMap[K]
    case 'invalid credentials':
      return errors.invalidCredentials() as ErrorsMap[K]
    case 'invalid token':
      return errors.invalidToken() as ErrorsMap[K]
    case 'internal':
      return errors.internal(error.detail) as ErrorsMap[K]
  }
  throw new Error('unreachable')
}

export default {
  health: {
    async healthCheck(req: RequestAdapter) {
      const reply = replier<types.api.health.healthCheck.responses>(req)

      const resourcesCheck: Record<string, (() => Promise<any>) | undefined> = {
        app: async () => {},
        jwt: async () => {},
        database: async () => {
          const dbConfig = getDatabaseConfig()

          try {
            const row = await queries.queryDatabaseInfo({ databaseName: dbConfig.name })
            response.database = {
              status: 'connected',
              version: row.version,
              maxConnections: row.max_connections,
              openedConnections: row.opened_connections,
              schemaVersion: row.schema_version,
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
    async login(req: RequestAdapter): Promise<ResponseAdapter> {
      const reply = replier<types.api.auth.login.responses>(req)

      const appConfig = getAppConfig()

      const validEnvironemnts: Array<typeof appConfig.environemnt> = ['development', 'test']
      let accessTokenExpireIn = 0
      let refreshTokenExpireIn = 0
      if (validEnvironemnts.includes(appConfig.environemnt)) {
        accessTokenExpireIn = getIntParam(req.getHeader('x-access-token-expires-in'), 0)
        refreshTokenExpireIn = getIntParam(req.getHeader('x-refresh-token-expires-in'), 0)
      }

      // Collect query parameters, path parameters, and request body
      const body = await req.getJsonBody()
      if (!validations.auth.login.body(body)) {
        return reply.fail(errors.ajv(validations.auth.login.body.errors![0]!))
      }
      const args: types.api.auth.login.body = body

      // Validate e execute the usecase
      const result = await mutations.login(args, { accessTokenExpireIn, refreshTokenExpireIn })

      if (!result.ok) {
        return reply.fail(mapError(result.error))
      }

      // Format the response
      return reply.send(200, result.value)
    },
    async refresh(req: RequestAdapter) {
      const reply = replier<types.api.auth.refresh.responses>(req)

      // Collect query parameters, path parameters, and request body
      const refreshToken = getAccessTokenFromRequest(req)
      if (!refreshToken) {
        return reply.fail(errors.invalidToken())
      }

      const result = await mutations.refresh({ refreshToken })

      if (!result.ok) {
        return reply.fail(mapError(result.error))
      }

      // Format the response
      return reply.send(200, result.value)
    },
    async me(req: RequestAdapter) {
      const reply = replier<types.api.auth.me.responses>(req)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      // Validate e execute the usecase
      const identity = await queries.queryIdentity({ userId: jwtData.userId })
      if (!identity) {
        console.error('jwt userId without identity:', jwtData.userId)
        return reply.fail(errors.invalidToken())
      }

      // Format the response
      return reply.send(200, presenter.identity(identity))
    },
  },
  appointments: {
    async listAppointments(req: RequestAdapter) {
      const reply = replier<types.api.appointments.listAppointments.responses>(req)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const query: types.api.appointments.listAppointments.query = req.getQueryParams()
      const page = getIntParam(query.page, 0)
      const pageSize = getIntParam(query.pageSize, 10)
      const startDate = getDateParam(query.startDate)
      const endDate = getDateParam(query.endDate)
      const serviceName = getStringParam(query.serviceName)
      const specialist = getStringParam(query.specialist)
      const customer = getStringParam(query.customer)
      const status = getIntParam(query.status, 0 /** all */)

      // Validate e execute the usecase
      const rows = await queries.queryAppointments({
        page,
        pageSize,
        startDate,
        endDate,
        serviceName,
        specialist,
        customer,
        status,
      })

      // Format the response
      return reply.send(200, rows.map(presenter.appointment))
    },
    async createAppointment(req: RequestAdapter) {
      const reply = replier<types.api.appointments.createAppointment.responses>(req)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const body = await req.getJsonBody()
      if (!validations.appointments.createAppointment.body(body)) {
        return reply.fail(errors.ajv(validations.appointments.createAppointment.body.errors![0]!))
      }
      const args: types.api.appointments.createAppointment.body = body

      // Validate e execute the usecase
      const result = await mutations.createAppointment(args)

      if (!result.ok) {
        return reply.fail(mapError(result.error))
      }

      // Format the response
      return reply.send(201, result.value)
    },
    async countAppointments(req: RequestAdapter) {
      const reply = replier<types.api.appointments.countAppointments.responses>(req)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const query: types.api.appointments.countAppointments.query = req.getQueryParams()
      const startDate = getDateParam(query.startDate)
      const endDate = getDateParam(query.endDate)
      const serviceName = getStringParam(query.serviceName)
      const specialist = getStringParam(query.specialist)
      const customer = getStringParam(query.customer)
      const status = getIntParam(query.status, 0 /** all */)

      // Validate e execute the usecase
      const count = await queries.queryAppointmentsCount({
        startDate,
        endDate,
        serviceName,
        specialist,
        customer,
        status,
      })

      // Format the response
      return reply.send(200, count)
    },
    async getAppointmentsCalendar(req: RequestAdapter) {
      const reply = replier<types.api.appointments.getAppointmentsCalendar.responses>(req)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const query: types.api.appointments.getAppointmentsCalendar.query = req.getQueryParams()
      const startDate = getDateParam(query.startDate)
      if (!startDate) {
        return reply.fail(errors.validation('query', 'startDate', 'invalid date format'))
      }
      const endDate = getDateParam(query.endDate)
      if (!endDate) {
        return reply.fail(errors.validation('query', 'endDate', 'invalid date format'))
      }

      // Validate e execute the usecase
      const rows = await queries.queryAppointmentsCalendar({ startDate, endDate })

      // Format the response
      return reply.send(200, rows.map(presenter.calendar))
    },
    async getAppointmentsCalendarCount(req: RequestAdapter) {
      const reply = replier<types.api.appointments.getAppointmentsCalendarCount.responses>(req)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const query: types.api.appointments.getAppointmentsCalendarCount.query = req.getQueryParams()
      const startDate = getDateParam(query.startDate)
      if (!startDate) {
        return reply.fail(errors.validation('query', 'startDate', 'invalid date format'))
      }
      const endDate = getDateParam(query.endDate)
      if (!endDate) {
        return reply.fail(errors.validation('query', 'endDate', 'invalid date format'))
      }

      // Validate e execute the usecase
      const calendarCount = await queries.queryAppointmentsCalendarCount({ startDate, endDate })

      // Format the response
      const response = presenter.calendarCount(calendarCount)
      return reply.send(200, response)
    },
    async getAppointmentById(req: RequestAdapter) {
      const reply = replier<types.api.appointments.getAppointmentById.responses>(req)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const id = parseUuid(req.getPathParam('id'))
      if (!id) {
        return reply.fail(errors.validation('path', 'id', 'invalid uuid'))
      }

      // Validate e execute the usecase
      const row = await queries.queryAppointment({ appointmentId: id })

      if (!row) {
        return reply.fail(errors.notFound('appointment'))
      }

      // Format the response
      return reply.send(200, presenter.appointment(row))
    },
    async updateAppointment(req: RequestAdapter) {
      const reply = replier<types.api.appointments.updateAppointment.responses>(req)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const id = parseUuid(req.getPathParam('id'))
      if (!id) {
        return reply.fail(errors.validation('path', 'id', 'invalid uuid'))
      }

      const body = await req.getJsonBody()
      if (!validations.appointments.updateAppointment.body(body)) {
        return reply.fail(errors.ajv(validations.appointments.updateAppointment.body.errors![0]!))
      }
      const args: types.api.appointments.updateAppointment.body = body

      // Validate e execute the usecase
      const result = await mutations.updateAppointment(id, args)

      if (!result.ok) {
        return reply.fail(mapError(result.error))
      }

      // Format the response
      return reply.send(200, result.value)
    },
    async deleteAppointment(req: RequestAdapter) {
      const reply = replier<types.api.appointments.deleteAppointment.responses>(req)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const id = parseUuid(req.getPathParam('id'))
      if (!id) {
        return reply.fail(errors.validation('path', 'id', 'invalid uuid'))
      }

      // Validate e execute the usecase
      const result = await mutations.deleteAppointment(id)

      if (!result.ok) {
        return reply.fail(mapError(result.error))
      }

      // Format the response
      return reply.send(204, '')
    },
  },
  customers: {
    async listCustomers(req: RequestAdapter) {
      const reply = replier<types.api.customers.listCustomers.responses>(req)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const query: types.api.customers.listCustomers.query = req.getQueryParams()
      const page = getIntParam(query.page, 0)
      const pageSize = getIntParam(query.pageSize, 10)
      const name = getStringParam(query.name, '')
      const cpf = getStringParam(query.cpf, '')
      const phone = getStringParam(query.phone, '')

      // Validate e execute the usecase
      const rows = await queries.queryCustomers({ page, pageSize, name, cpf, phone })

      // Format the response
      return reply.send(200, rows.map(presenter.customer))
    },
    async createCustomer(req: RequestAdapter) {
      const reply = replier<types.api.customers.createCustomer.responses>(req)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const body = await req.getJsonBody()
      if (!validations.customers.createCustomer.body(body)) {
        return reply.fail(errors.ajv(validations.customers.createCustomer.body.errors![0]!))
      }
      const args: types.api.customers.createCustomer.body = body

      // Validate e execute the usecase
      const result = await mutations.createCustomer(args)

      if (!result.ok) {
        return reply.fail(mapError(result.error))
      }

      // Format the response
      return reply.send(201, result.value)
    },
    async countCustomers(req: RequestAdapter) {
      const reply = replier<types.api.customers.countCustomers.responses>(req)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const query: types.api.customers.countCustomers.query = req.getQueryParams()
      const name = getStringParam(query.name, '')
      const cpf = getStringParam(query.cpf, '')
      const phone = getStringParam(query.phone, '')

      // Validate e execute the usecase
      const count = await queries.queryCustomersCount({ name, cpf, phone })

      // Format the response
      return reply.send(200, count)
    },
    async getCustomerById(req: RequestAdapter) {
      const reply = replier<types.api.customers.getCustomerById.responses>(req)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const id = parseUuid(req.getPathParam('id'))
      if (!id) {
        return reply.fail(errors.validation('path', 'id', 'invalid uuid'))
      }

      // Validate e execute the usecase
      const row = await queries.queryCustomer({ customerId: id })

      if (!row) {
        return reply.fail(errors.notFound('customer'))
      }

      // Format the response
      return reply.send(200, presenter.customer(row))
    },
    async updateCustomer(req: RequestAdapter) {
      const reply = replier<types.api.customers.updateCustomer.responses>(req)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const id = parseUuid(req.getPathParam('id'))
      if (!id) {
        return reply.fail(errors.validation('path', 'id', 'invalid uuid'))
      }

      const body = await req.getJsonBody()
      if (!validations.customers.updateCustomer.body(body)) {
        return reply.fail(errors.ajv(validations.customers.updateCustomer.body.errors![0]!))
      }
      const args: types.api.customers.updateCustomer.body = body

      // Validate e execute the usecase
      const result = await mutations.updateCustomer(id, args)

      if (!result.ok) {
        return reply.fail(mapError(result.error))
      }

      // Format the response
      return reply.send(200, result.value)
    },
    async deleteCustomer(req: RequestAdapter) {
      const reply = replier<types.api.customers.deleteCustomer.responses>(req)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const id = parseUuid(req.getPathParam('id'))
      if (!id) {
        return reply.fail(errors.validation('path', 'id', 'invalid uuid'))
      }

      // Validate e execute the usecase
      const result = await mutations.deleteCustomer(id)

      if (!result.ok) {
        return reply.fail(mapError(result.error))
      }

      // Format the response
      return reply.send(204, '')
    },
  },
  secretaries: {
    async listSecretaries(req: RequestAdapter) {
      const reply = replier<types.api.secretaries.listSecretaries.responses>(req)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }
      if (!jwtData.hasAccess()) {
        return reply.fail(errors.invalidAccess('Role without access'))
      }

      const query: types.api.secretaries.listSecretaries.query = req.getQueryParams()
      const page = getIntParam(query.page, 0)
      const pageSize = getIntParam(query.pageSize, 10)
      const name = getStringParam(query.name, '')
      const cpf = getStringParam(query.cpf, '')
      const cnpj = getStringParam(query.cnpj, '')
      const phone = getStringParam(query.phone, '')

      // Validate e execute the usecase
      const rows = await queries.querySecretaries({ page, pageSize, name, cpf, cnpj, phone })

      // Format the response
      return reply.send(200, rows.map(presenter.secretary))
    },
    async createSecretary(req: RequestAdapter) {
      const reply = replier<types.api.secretaries.createSecretary.responses>(req)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }
      if (!jwtData.hasAccess()) {
        return reply.fail(errors.invalidAccess('Role without access'))
      }

      const body = await req.getJsonBody()
      if (!validations.secretaries.createSecretary.body(body)) {
        return reply.fail(errors.ajv(validations.secretaries.createSecretary.body.errors![0]!))
      }
      const args: types.api.secretaries.createSecretary.body = body

      // Validate e execute the usecase
      const result = await mutations.createSecretary(args)

      if (!result.ok) {
        return reply.fail(mapError(result.error))
      }

      // Format the response
      return reply.send(201, result.value)
    },
    async countSecretaries(req: RequestAdapter) {
      const reply = replier<types.api.secretaries.countSecretaries.responses>(req)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }
      if (!jwtData.hasAccess()) {
        return reply.fail(errors.invalidAccess('Role without access'))
      }

      const query: types.api.secretaries.countSecretaries.query = req.getQueryParams()
      const name = getStringParam(query.name, '')
      const cpf = getStringParam(query.cpf, '')
      const cnpj = getStringParam(query.cnpj, '')
      const phone = getStringParam(query.phone, '')

      // Validate e execute the usecase
      const count = await queries.querySecretariesCount({ name, cpf, cnpj, phone })

      // Format the response
      return reply.send(200, count)
    },
    async getSecretaryById(req: RequestAdapter) {
      const reply = replier<types.api.secretaries.getSecretaryById.responses>(req)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }
      if (!jwtData.hasAccess('secretary')) {
        return reply.fail(errors.invalidAccess('Role without access'))
      }

      const id = parseUuid(req.getPathParam('id'))
      if (!id) {
        return reply.fail(errors.validation('path', 'id', 'invalid uuid'))
      }
      if (jwtData.role === 'secretary' && jwtData.userId !== id) {
        return reply.fail(errors.invalidAccess('User without access'))
      }

      // Validate e execute the usecase
      const row = await queries.querySecretary({ secretaryId: id })

      if (!row) {
        return reply.fail(errors.notFound('secretary'))
      }

      // Format the response
      return reply.send(200, presenter.secretary(row))
    },
    async updateSecretary(req: RequestAdapter) {
      const reply = replier<types.api.secretaries.updateSecretary.responses>(req)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }
      if (!jwtData.hasAccess('secretary')) {
        return reply.fail(errors.invalidAccess('Role without access'))
      }

      const id = parseUuid(req.getPathParam('id'))
      if (!id) {
        return reply.fail(errors.validation('path', 'id', 'invalid uuid'))
      }
      if (jwtData.role === 'secretary' && jwtData.userId !== id) {
        return reply.fail(errors.invalidAccess('User without access'))
      }

      const body = await req.getJsonBody()
      if (!validations.secretaries.updateSecretary.body(body)) {
        return reply.fail(errors.ajv(validations.secretaries.updateSecretary.body.errors![0]!))
      }
      const args: types.api.secretaries.updateSecretary.body = body

      // Validate e execute the usecase
      const result = await mutations.updateSecretary(id, args)

      if (!result.ok) {
        return reply.fail(mapError(result.error))
      }

      // Format the response
      return reply.send(200, result.value)
    },
    async deleteSecretary(req: RequestAdapter) {
      const reply = replier<types.api.secretaries.deleteSecretary.responses>(req)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }
      if (!jwtData.hasAccess()) {
        return reply.fail(errors.invalidAccess('Role without access'))
      }

      const id = parseUuid(req.getPathParam('id'))
      if (!id) {
        return reply.fail(errors.validation('path', 'id', 'invalid uuid'))
      }

      // Validate e execute the usecase
      const result = await mutations.deleteSecretary(id)

      if (!result.ok) {
        return reply.fail(mapError(result.error))
      }

      // Format the response
      return reply.send(204, '')
    },
  },
  servicesAvailable: {
    async listServicesAvailable(req: RequestAdapter) {
      const reply = replier<types.api.servicesAvailable.listServicesAvailable.responses>(req)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const query: types.api.servicesAvailable.listServicesAvailable.query = req.getQueryParams()
      const page = getIntParam(query.page, 0)
      const pageSize = getIntParam(query.pageSize, 10)

      // Validate e execute the usecase
      const rows = await queries.queryServiceAvailables({ page, pageSize })

      // Format the response
      return reply.send(200, rows.map(presenter.serviceGroup))
    },
    async createServiceAvailable(req: RequestAdapter) {
      const reply = replier<types.api.servicesAvailable.createServiceAvailable.responses>(req)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const body = await req.getJsonBody()
      if (!validations.servicesAvailable.createServiceAvailable.body(body)) {
        return reply.fail(errors.ajv(validations.servicesAvailable.createServiceAvailable.body.errors![0]!))
      }
      const args: types.api.servicesAvailable.createServiceAvailable.body = body

      if (!args.specialization && !args.specializationId) {
        return reply.fail(errors.missingValue('body', 'specializationId'))
      }

      // Validate e execute the usecase
      const result = await mutations.createServiceAvailable(args)

      if (!result.ok) {
        return reply.fail(mapError(result.error))
      }

      // Format the response
      return reply.send(201, result.value)
    },
    async getServiceAvailableById(req: RequestAdapter) {
      const reply = replier<types.api.servicesAvailable.getServiceAvailableById.responses>(req)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const id = parseUuid(req.getPathParam('id'))
      if (!id) {
        return reply.fail(errors.validation('path', 'id', 'invalid uuid'))
      }

      // Validate e execute the usecase
      const row = await queries.queryServiceAvailable({ serviceAvailableId: id })

      if (!row) {
        return reply.fail(errors.notFound('service_name'))
      }

      // Format the response
      return reply.send(200, presenter.serviceAvailable(row))
    },
    async updateServiceAvailable(req: RequestAdapter) {
      const reply = replier<types.api.servicesAvailable.updateServiceAvailable.responses>(req)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const id = parseUuid(req.getPathParam('id'))
      if (!id) {
        return reply.fail(errors.validation('path', 'id', 'invalid uuid'))
      }

      const body = await req.getJsonBody()
      if (!validations.servicesAvailable.updateServiceAvailable.body(body)) {
        return reply.fail(errors.ajv(validations.servicesAvailable.updateServiceAvailable.body.errors![0]!))
      }
      const args: types.api.servicesAvailable.updateServiceAvailable.body = body

      // Validate e execute the usecase
      const result = await mutations.updateServiceAvailable(id, args)

      if (!result.ok) {
        return reply.fail(mapError(result.error))
      }

      // Format the response
      return reply.send(200, result.value)
    },
    async deleteServiceAvailable(req: RequestAdapter) {
      const reply = replier<types.api.servicesAvailable.deleteServiceAvailable.responses>(req)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const id = parseUuid(req.getPathParam('id'))
      if (!id) {
        return reply.fail(errors.validation('path', 'id', 'invalid uuid'))
      }

      // Validate e execute the usecase
      const result = await mutations.deleteServiceAvailable(id)

      if (!result.ok) {
        return reply.fail(mapError(result.error))
      }

      // Format the response
      return reply.send(204, '')
    },
  },
  services: {
    async listServices(req: RequestAdapter) {
      const reply = replier<types.api.services.listServices.responses>(req)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const query: types.api.services.listServices.query = req.getQueryParams()
      const page = getIntParam(query.page, 0)
      const pageSize = getIntParam(query.pageSize, 10)
      const service = getStringParam(query.service).toLowerCase()
      const specialist = getStringParam(query.specialist).toLowerCase()
      const specialization = getStringParam(query.specialization).toLowerCase()

      // Validate e execute the usecase
      const rows = await queries.queryServices({ page, pageSize, service, specialist, specialization })

      // Format the response
      return reply.send(200, rows.map(presenter.serviceEnhanced))
    },
    async createService(req: RequestAdapter) {
      const reply = replier<types.api.services.createService.responses>(req)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const body = await req.getJsonBody()
      if (!validations.services.createService.body(body)) {
        return reply.fail(errors.ajv(validations.services.createService.body.errors![0]!))
      }
      const args: types.api.services.createService.body = body

      // Validate e execute the usecase
      const result = await mutations.createService(args)

      if (!result.ok) {
        return reply.fail(mapError(result.error))
      }

      // Format the response
      return reply.send(201, result.value)
    },
    async countServices(req: RequestAdapter) {
      const reply = replier<types.api.services.countServices.responses>(req)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const query: types.api.services.countServices.query = req.getQueryParams()
      const service = getStringParam(query.service).toLowerCase()
      const specialist = getStringParam(query.specialist).toLowerCase()
      const specialization = getStringParam(query.specialization).toLowerCase()

      // Validate e execute the usecase
      const count = await queries.queryServicesCount({ service, specialist, specialization })

      // Format the response
      return reply.send(200, count)
    },
    async getServiceById(req: RequestAdapter) {
      const reply = replier<types.api.services.getServiceById.responses>(req)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const id = parseUuid(req.getPathParam('id'))
      if (!id) {
        return reply.fail(errors.validation('path', 'id', 'invalid uuid'))
      }

      // Validate e execute the usecase
      const row = await queries.queryService({ serviceId: id })

      if (!row) {
        return reply.fail(errors.notFound('service'))
      }

      // Format the response
      return reply.send(200, presenter.service(row))
    },
    async updateService(req: RequestAdapter) {
      const reply = replier<types.api.services.updateService.responses>(req)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const id = parseUuid(req.getPathParam('id'))
      if (!id) {
        return reply.fail(errors.validation('path', 'id', 'invalid uuid'))
      }

      const body = await req.getJsonBody()
      if (!validations.services.updateService.body(body)) {
        return reply.fail(errors.ajv(validations.services.updateService.body.errors![0]!))
      }
      const args: types.api.services.updateService.body = body

      // Validate e execute the usecase
      const result = await mutations.updateService(id, args)

      if (!result.ok) {
        return reply.fail(mapError(result.error))
      }

      // Format the response
      return reply.send(200, result.value)
    },
    async deleteService(req: RequestAdapter) {
      const reply = replier<types.api.services.deleteService.responses>(req)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const id = parseUuid(req.getPathParam('id'))
      if (!id) {
        return reply.fail(errors.validation('path', 'id', 'invalid uuid'))
      }

      // Validate e execute the usecase
      const result = await mutations.deleteService(id)

      if (!result.ok) {
        return reply.fail(mapError(result.error))
      }

      // Format the response
      return reply.send(204, '')
    },
  },
  serviceGroups: {
    async listServiceGroups(req: RequestAdapter) {
      const reply = replier<types.api.serviceGroups.listServiceGroups.responses>(req)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      // Validate e execute the usecase
      const rows = await queries.queryServiceGroups()

      // Format the response
      return reply.send(200, rows.map(presenter.serviceGroup))
    },
  },
  specialists: {
    async listSpecialists(req: RequestAdapter) {
      const reply = replier<types.api.specialists.listSpecialists.responses>(req)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const query: types.api.specialists.listSpecialists.query = req.getQueryParams()
      const page = getIntParam(query.page, 0)
      const pageSize = getIntParam(query.pageSize, 10)
      const name = getStringParam(query.name)
      const cpf = getStringParam(query.cpf)
      const cnpj = getStringParam(query.cnpj)
      const phone = getStringParam(query.phone)

      // Validate e execute the usecase
      const rows = await queries.querySpecialists({ page, pageSize, name, cpf, cnpj, phone })

      // Format the response
      return reply.send(200, rows.map(presenter.specialist))
    },
    async createSpecialist(req: RequestAdapter) {
      const reply = replier<types.api.specialists.createSpecialist.responses>(req)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const body = await req.getJsonBody()
      if (!validations.specialists.createSpecialist.body(body)) {
        return reply.fail(errors.ajv(validations.specialists.createSpecialist.body.errors![0]!))
      }
      const args: types.api.specialists.createSpecialist.body = body

      // Validate e execute the usecase
      const result = await mutations.createSpecialist(args)

      if (!result.ok) {
        return reply.fail(mapError(result.error))
      }

      // Format the response
      return reply.send(201, result.value)
    },
    async countSpecialists(req: RequestAdapter) {
      const reply = replier<types.api.specialists.countSpecialists.responses>(req)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const query: types.api.specialists.countSpecialists.query = req.getQueryParams()
      const name = getStringParam(query.name)
      const cpf = getStringParam(query.cpf)
      const cnpj = getStringParam(query.cnpj)
      const phone = getStringParam(query.phone)

      // Validate e execute the usecase
      const count = await queries.querySpecialistsCount({ name, cpf, cnpj, phone })

      // Format the response
      return reply.send(200, count)
    },
    async getSpecialistById(req: RequestAdapter) {
      const reply = replier<types.api.specialists.getSpecialistById.responses>(req)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const id = parseUuid(req.getPathParam('id'))
      if (!id) {
        return reply.fail(errors.validation('path', 'id', 'invalid uuid'))
      }

      // Validate e execute the usecase
      const row = await queries.querySpecialist({ specialistId: id })

      if (!row) {
        return reply.fail(errors.notFound('specialist'))
      }

      // Format the response
      return reply.send(200, presenter.specialist(row))
    },
    async getSpecialistServices(req: RequestAdapter) {
      const reply = replier<types.api.specialists.getSpecialistServices.responses>(req)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const id = parseUuid(req.getPathParam('id'))
      if (!id) {
        return reply.fail(errors.validation('path', 'id', 'invalid uuid'))
      }

      // Validate e execute the usecase
      const rows = await queries.querySpecialistServices({ specialistId: id })

      // Format the response
      return reply.send(200, rows.map(presenter.specialistService))
    },
    async getSpecialistSpecializations(req: RequestAdapter) {
      const reply = replier<types.api.specialists.getSpecialistSpecializations.responses>(req)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const id = parseUuid(req.getPathParam('id'))
      if (!id) {
        return reply.fail(errors.validation('path', 'id', 'invalid uuid'))
      }

      // Validate e execute the usecase
      const rows = await queries.querySpecialistSpecializations({ specialistId: id })

      // Format the response
      return reply.send(200, rows)
    },
    async getSpecialistAppointments(req: RequestAdapter) {
      const reply = replier<types.api.specialists.getSpecialistAppointments.responses>(req)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const id = parseUuid(req.getPathParam('id'))
      if (!id) {
        return reply.fail(errors.validation('path', 'id', 'invalid uuid'))
      }

      const query: types.api.specialists.getSpecialistAppointments.query = req.getQueryParams()
      const page = getIntParam(query.page, 0)
      const pageSize = getIntParam(query.pageSize, 10)

      // Validate e execute the usecase
      const rows = await queries.querySpecialistAppointments({ page, pageSize, specialistId: id })

      // Format the response
      return reply.send(200, rows.map(presenter.specialistAppointment))
    },
    async getSpecialistService(req: RequestAdapter) {
      const reply = replier<types.api.specialists.getSpecialistService.responses>(req)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const id = parseUuid(req.getPathParam('id'))
      if (!id) {
        return reply.fail(errors.validation('path', 'id', 'invalid uuid'))
      }
      const serviceId = parseUuid(req.getPathParam('service_id'))
      if (!serviceId) {
        return reply.fail(errors.validation('path', 'service_id', 'invalid uuid'))
      }

      // Validate e execute the usecase
      const row = await queries.querySpecialistService({ specialistId: id, serviceId })

      if (!row) {
        return reply.fail(errors.notFound('service'))
      }

      // Format the response
      return reply.send(200, presenter.service(row))
    },
    async updateSpecialist(req: RequestAdapter) {
      const reply = replier<types.api.specialists.updateSpecialist.responses>(req)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const id = parseUuid(req.getPathParam('id'))
      if (!id) {
        return reply.fail(errors.validation('path', 'id', 'invalid uuid'))
      }

      const body = await req.getJsonBody()
      if (!validations.specialists.updateSpecialist.body(body)) {
        return reply.fail(errors.ajv(validations.specialists.updateSpecialist.body.errors![0]!))
      }
      const args: types.api.specialists.updateSpecialist.body = body

      // Validate e execute the usecase
      const result = await mutations.updateSpecialist(id, args)

      if (!result.ok) {
        return reply.fail(mapError(result.error))
      }

      // Format the response
      return reply.send(200, result.value)
    },
    async deleteSpecialist(req: RequestAdapter) {
      const reply = replier<types.api.specialists.deleteSpecialist.responses>(req)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const id = parseUuid(req.getPathParam('id'))
      if (!id) {
        return reply.fail(errors.validation('path', 'id', 'invalid uuid'))
      }

      // Validate e execute the usecase
      const result = await mutations.deleteSpecialist(id)

      if (!result.ok) {
        return reply.fail(mapError(result.error))
      }

      // Format the response
      return reply.send(204, '')
    },
  },
  specializations: {
    async listSpecializations(req: RequestAdapter) {
      const reply = replier<types.api.specializations.listSpecializations.responses>(req)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      // Validate e execute the usecase
      const rows = await queries.querySpecializations()

      // Format the response
      return reply.send(200, rows)
    },
    async createSpecialization(req: RequestAdapter) {
      const reply = replier<types.api.specializations.createSpecialization.responses>(req)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const body = await req.getJsonBody()
      if (!validations.specializations.createSpecialization.body(body)) {
        return reply.fail(errors.ajv(validations.specializations.createSpecialization.body.errors![0]!))
      }
      const args: types.api.specializations.createSpecialization.body = body

      // Validate e execute the usecase
      const result = await mutations.createSpecialization(args)

      if (!result.ok) {
        return reply.fail(mapError(result.error))
      }

      // Format the response
      return reply.send(201, result.value)
    },
    async updateSpecialization(req: RequestAdapter) {
      const reply = replier<types.api.specializations.updateSpecialization.responses>(req)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const id = parseUuid(req.getPathParam('id'))
      if (!id) {
        return reply.fail(errors.validation('path', 'id', 'invalid uuid'))
      }

      const body = await req.getJsonBody()
      if (!validations.specializations.updateSpecialization.body(body)) {
        return reply.fail(errors.ajv(validations.specializations.updateSpecialization.body.errors![0]!))
      }
      const args: types.api.specializations.updateSpecialization.body = body

      // Validate e execute the usecase
      const result = await mutations.updateSpecialization(id, args)

      if (!result.ok) {
        return reply.fail(mapError(result.error))
      }

      // Format the response
      return reply.send(200, result.value)
    },
    async deleteSpecialization(req: RequestAdapter) {
      const reply = replier<types.api.specializations.deleteSpecialization.responses>(req)

      // Collect query parameters, path parameters, and request body
      const jwtData = await getJwtDataFromRequest(req)
      if (!jwtData) {
        return reply.fail(errors.invalidToken())
      }

      const id = parseUuid(req.getPathParam('id'))
      if (!id) {
        return reply.fail(errors.validation('path', 'id', 'invalid uuid'))
      }

      // Validate e execute the usecase
      const result = await mutations.deleteSpecialization(id)

      if (!result.ok) {
        return reply.fail(mapError(result.error))
      }

      // Format the response
      return reply.send(204, '')
    },
  },
  test: {
    async initTest(req: RequestAdapter) {
      const reply = replier<types.api.test.initTest.responses>(req)

      await mutations.initTest()

      return reply.send(200, 'System initialized to be tested')
    },
    async statsTest(req: RequestAdapter) {
      const reply = replier<types.api.test.statsTest.responses>(req)

      const dbConfig = getDatabaseConfig()

      return reply.send(200, {
        database: `user=${dbConfig.user} password=${dbConfig.password} host=${dbConfig.host} port=${dbConfig.port} dbname=${dbConfig.name}`,
        message: 'Environment: TEST',
      })
    },
    async debugClaimsTest(req: RequestAdapter) {
      const reply = replier<types.api.test.debugClaimsTest.responses>(req)

      return reply.send(200, 'OK')
    },
  },
} satisfies Record<string, Record<string, Resolver>>
