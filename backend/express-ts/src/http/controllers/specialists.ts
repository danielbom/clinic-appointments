import { getIntParam, getJwtDataFromRequest, getStringParam, getUuidParam } from '../../core/utils'
import * as mutations from '../../domain/mutations'
import { presenter } from '../../domain/presenter'
import * as queries from '../../domain/queries'
import { type RequestAdapter, replier } from '../../lib/http-adapter'
import { mapError } from '../errors/domain'
import { errors } from '../errors/presenter'
import type * as types from '../types'
import { validations } from '../validations'

export async function listSpecialists(req: RequestAdapter) {
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

  // Validate and execute the usecase
  const rows = await queries.querySpecialists({ page, pageSize, name, cpf, cnpj, phone })

  // Format the response
  return reply.send(200, rows.map(presenter.specialist))
}

export async function createSpecialist(req: RequestAdapter) {
  const reply = replier<types.api.specialists.createSpecialist.responses>(req)

  // Collect query parameters, path parameters, and request body
  const jwtData = await getJwtDataFromRequest(req)
  if (!jwtData) {
    return reply.fail(errors.invalidToken())
  }

  const body = await req.getJsonBody()
  const valid = validations.specialists.createSpecialist.body(body)
  if (!valid.ok) {
    return reply.fail(errors.ajv(valid.errors[0]))
  }
  const args: types.api.specialists.createSpecialist.body = valid.value

  // Validate and execute the usecase
  const result = await mutations.createSpecialist(args)

  if (!result.ok) {
    return reply.fail(mapError(result.error))
  }

  // Format the response
  return reply.send(201, result.value)
}

export async function countSpecialists(req: RequestAdapter) {
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

  // Validate and execute the usecase
  const count = await queries.querySpecialistsCount({ name, cpf, cnpj, phone })

  // Format the response
  return reply.send(200, count)
}

export async function getSpecialistById(req: RequestAdapter) {
  const reply = replier<types.api.specialists.getSpecialistById.responses>(req)

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
  const row = await queries.querySpecialist({ specialistId: id })

  if (!row) {
    return reply.fail(errors.notFound('specialist'))
  }

  // Format the response
  return reply.send(200, presenter.specialist(row))
}

export async function getSpecialistServices(req: RequestAdapter) {
  const reply = replier<types.api.specialists.getSpecialistServices.responses>(req)

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
  const rows = await queries.querySpecialistServices({ specialistId: id })

  // Format the response
  return reply.send(200, rows.map(presenter.specialistService))
}

export async function getSpecialistSpecializations(req: RequestAdapter) {
  const reply = replier<types.api.specialists.getSpecialistSpecializations.responses>(req)

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
  const rows = await queries.querySpecialistSpecializations({ specialistId: id })

  // Format the response
  return reply.send(200, rows)
}

export async function getSpecialistAppointments(req: RequestAdapter) {
  const reply = replier<types.api.specialists.getSpecialistAppointments.responses>(req)

  // Collect query parameters, path parameters, and request body
  const jwtData = await getJwtDataFromRequest(req)
  if (!jwtData) {
    return reply.fail(errors.invalidToken())
  }

  const id = getUuidParam(req.getPathParam('id'))
  if (!id) {
    return reply.fail(errors.validation('path', 'id', 'invalid uuid'))
  }

  const query: types.api.specialists.getSpecialistAppointments.query = req.getQueryParams()
  const page = getIntParam(query.page, 0)
  const pageSize = getIntParam(query.pageSize, 10)

  // Validate and execute the usecase
  const rows = await queries.querySpecialistAppointments({ page, pageSize, specialistId: id })

  // Format the response
  return reply.send(200, rows.map(presenter.specialistAppointment))
}

export async function getSpecialistService(req: RequestAdapter) {
  const reply = replier<types.api.specialists.getSpecialistService.responses>(req)

  // Collect query parameters, path parameters, and request body
  const jwtData = await getJwtDataFromRequest(req)
  if (!jwtData) {
    return reply.fail(errors.invalidToken())
  }

  const id = getUuidParam(req.getPathParam('id'))
  if (!id) {
    return reply.fail(errors.validation('path', 'id', 'invalid uuid'))
  }
  const serviceId = getUuidParam(req.getPathParam('service_id'))
  if (!serviceId) {
    return reply.fail(errors.validation('path', 'service_id', 'invalid uuid'))
  }

  // Validate and execute the usecase
  const row = await queries.querySpecialistService({ specialistId: id, serviceId })

  if (!row) {
    return reply.fail(errors.notFound('service'))
  }

  // Format the response
  return reply.send(200, presenter.service(row))
}

export async function updateSpecialist(req: RequestAdapter) {
  const reply = replier<types.api.specialists.updateSpecialist.responses>(req)

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
  const valid = validations.specialists.updateSpecialist.body(body)
  if (!valid.ok) {
    return reply.fail(errors.ajv(valid.errors[0]))
  }
  const args: types.api.specialists.updateSpecialist.body = valid.value

  // Validate and execute the usecase
  const result = await mutations.updateSpecialist(id, args)

  if (!result.ok) {
    return reply.fail(mapError(result.error))
  }

  // Format the response
  return reply.send(200, result.value)
}

export async function deleteSpecialist(req: RequestAdapter) {
  const reply = replier<types.api.specialists.deleteSpecialist.responses>(req)

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
  const result = await mutations.deleteSpecialist(id)

  if (!result.ok) {
    return reply.fail(mapError(result.error))
  }

  // Format the response
  return reply.send(204, '')
}
