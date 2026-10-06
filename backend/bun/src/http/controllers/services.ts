import { getIntParam, getJwtDataFromRequest, getStringParam, getUuidParam } from '../../core/utils'
import * as mutations from '../../domain/mutations'
import { presenter } from '../../domain/presenter'
import * as queries from '../../domain/queries'
import { type RequestAdapter, replier } from '../../lib/http-adapter'
import { mapError } from '../errors/domain'
import { errors } from '../errors/presenter'
import type * as types from '../types'
import { validations } from '../validations'

export async function listServices(req: RequestAdapter) {
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

  // Validate and execute the usecase
  const rows = await queries.queryServices({ page, pageSize, service, specialist, specialization })

  // Format the response
  return reply.send(200, rows.map(presenter.serviceEnhanced))
}

export async function createService(req: RequestAdapter) {
  const reply = replier<types.api.services.createService.responses>(req)

  // Collect query parameters, path parameters, and request body
  const jwtData = await getJwtDataFromRequest(req)
  if (!jwtData) {
    return reply.fail(errors.invalidToken())
  }

  const body = await req.getJsonBody()
  const valid = validations.services.createService.body(body)
  if (!valid.ok) {
    return reply.fail(errors.ajv(valid.errors[0]))
  }
  const args: types.api.services.createService.body = valid.value

  // Validate and execute the usecase
  const result = await mutations.createService(args)

  if (!result.ok) {
    return reply.fail(mapError(result.error))
  }

  // Format the response
  return reply.send(201, result.value)
}

export async function countServices(req: RequestAdapter) {
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

  // Validate and execute the usecase
  const count = await queries.queryServicesCount({ service, specialist, specialization })

  // Format the response
  return reply.send(200, count)
}

export async function getServiceById(req: RequestAdapter) {
  const reply = replier<types.api.services.getServiceById.responses>(req)

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
  const row = await queries.queryService({ serviceId: id })

  if (!row) {
    return reply.fail(errors.notFound('service'))
  }

  // Format the response
  return reply.send(200, presenter.service(row))
}

export async function updateService(req: RequestAdapter) {
  const reply = replier<types.api.services.updateService.responses>(req)

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
  const valid = validations.services.updateService.body(body)
  if (!valid.ok) {
    return reply.fail(errors.ajv(valid.errors[0]))
  }
  const args: types.api.services.updateService.body = valid.value

  // Validate and execute the usecase
  const result = await mutations.updateService(id, args)

  if (!result.ok) {
    return reply.fail(mapError(result.error))
  }

  // Format the response
  return reply.send(200, result.value)
}

export async function deleteService(req: RequestAdapter) {
  const reply = replier<types.api.services.deleteService.responses>(req)

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
  const result = await mutations.deleteService(id)

  if (!result.ok) {
    return reply.fail(mapError(result.error))
  }

  // Format the response
  return reply.send(204, '')
}
