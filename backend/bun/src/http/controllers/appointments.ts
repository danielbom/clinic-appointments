import { getDateParam, getIntParam, getJwtDataFromRequest, getStringParam, getUuidParam } from '../../core/utils'
import * as mutations from '../../domain/mutations'
import { presenter } from '../../domain/presenter'
import * as queries from '../../domain/queries'
import { type RequestAdapter, replier } from '../../lib/http-adapter'
import { mapError } from '../errors/domain'
import { errors } from '../errors/presenter'
import type * as types from '../types'
import { validations } from '../validations'

export async function listAppointments(req: RequestAdapter) {
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

  // Validate and execute the usecase
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
}

export async function createAppointment(req: RequestAdapter) {
  const reply = replier<types.api.appointments.createAppointment.responses>(req)

  // Collect query parameters, path parameters, and request body
  const jwtData = await getJwtDataFromRequest(req)
  if (!jwtData) {
    return reply.fail(errors.invalidToken())
  }

  const body = await req.getJsonBody()
  const valid = validations.appointments.createAppointment.body(body)
  if (!valid.ok) {
    return reply.fail(errors.ajv(valid.errors[0]))
  }
  const args: types.api.appointments.createAppointment.body = valid.value

  // Validate and execute the usecase
  const result = await mutations.createAppointment(args)

  if (!result.ok) {
    return reply.fail(mapError(result.error))
  }

  // Format the response
  return reply.send(201, result.value)
}

export async function countAppointments(req: RequestAdapter) {
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

  // Validate and execute the usecase
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
}

export async function getAppointmentsCalendar(req: RequestAdapter) {
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

  // Validate and execute the usecase
  const rows = await queries.queryAppointmentsCalendar({ startDate, endDate })

  // Format the response
  return reply.send(200, rows.map(presenter.calendar))
}

export async function getAppointmentsCalendarCount(req: RequestAdapter) {
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

  // Validate and execute the usecase
  const calendarCount = await queries.queryAppointmentsCalendarCount({ startDate, endDate })

  // Format the response
  const response = presenter.calendarCount(calendarCount)
  return reply.send(200, response)
}

export async function getAppointmentById(req: RequestAdapter) {
  const reply = replier<types.api.appointments.getAppointmentById.responses>(req)

  // Collect query parameters, path parameters, and request body
  const jwtData = await getJwtDataFromRequest(req)
  if (!jwtData) {
    return reply.fail(errors.invalidToken())
  }

  const id = getUuidParam(req.getPathParam('id'))
  if (!id) {
    return reply.fail(errors.validation('path', 'id', 'invalid uuid'))
  }

  // Validate and execute the usecase
  const row = await queries.queryAppointment({ appointmentId: id })

  if (!row) {
    return reply.fail(errors.notFound('appointment'))
  }

  // Format the response
  return reply.send(200, presenter.appointment(row))
}

export async function updateAppointment(req: RequestAdapter) {
  const reply = replier<types.api.appointments.updateAppointment.responses>(req)

  // Collect query parameters, path parameters, and request body
  const jwtData = await getJwtDataFromRequest(req)
  if (!jwtData) {
    return reply.fail(errors.invalidToken())
  }

  const id = getUuidParam(req.getPathParam('id'))
  if (!id) {
    return reply.fail(errors.validation('path', 'id', 'invalid uuid'))
  }

  const body = await req.getJsonBody()
  const valid = validations.appointments.updateAppointment.body(body)
  if (!valid.ok) {
    return reply.fail(errors.ajv(valid.errors[0]))
  }
  const args: types.api.appointments.updateAppointment.body = valid.value

  // Validate and execute the usecase
  const result = await mutations.updateAppointment(id, args)

  if (!result.ok) {
    return reply.fail(mapError(result.error))
  }

  // Format the response
  return reply.send(200, result.value)
}

export async function deleteAppointment(req: RequestAdapter) {
  const reply = replier<types.api.appointments.deleteAppointment.responses>(req)

  // Collect query parameters, path parameters, and request body
  const jwtData = await getJwtDataFromRequest(req)
  if (!jwtData) {
    return reply.fail(errors.invalidToken())
  }

  const id = getUuidParam(req.getPathParam('id'))
  if (!id) {
    return reply.fail(errors.validation('path', 'id', 'invalid uuid'))
  }

  // Validate and execute the usecase
  const result = await mutations.deleteAppointment(id)

  if (!result.ok) {
    return reply.fail(mapError(result.error))
  }

  // Format the response
  return reply.send(204, '')
}

export async function appointmentRealized(req: RequestAdapter) {
  const reply = replier<types.api.appointments.appointmentRealized.responses>(req)

  // Collect query parameters, path parameters, and request body
  const jwtData = await getJwtDataFromRequest(req)
  if (!jwtData) {
    return reply.fail(errors.invalidToken())
  }

  const id = getUuidParam(req.getPathParam('id'))
  if (!id) {
    return reply.fail(errors.validation('path', 'id', 'invalid uuid'))
  }

  // Validate and execute the usecase
  // TODO: confirm payment
  const result = await mutations.appointmentRealized(id)

  if (!result.ok) {
    return reply.fail(mapError(result.error))
  }

  return reply.send(200, result.value)
}

export async function appointmentCanceled(req: RequestAdapter) {
  const reply = replier<types.api.appointments.appointmentCanceled.responses>(req)

  // Collect query parameters, path parameters, and request body
  const jwtData = await getJwtDataFromRequest(req)
  if (!jwtData) {
    return reply.fail(errors.invalidToken())
  }

  const id = getUuidParam(req.getPathParam('id'))
  if (!id) {
    return reply.fail(errors.validation('path', 'id', 'invalid uuid'))
  }

  // Validate and execute the usecase
  // TODO: require a reason
  // TODO: notify specialist & customer
  const result = await mutations.appointmentCanceled(id)

  if (!result.ok) {
    return reply.fail(mapError(result.error))
  }

  return reply.send(200, result.value)
}
