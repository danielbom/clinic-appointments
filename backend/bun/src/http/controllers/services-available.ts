import { getIntParam, getJwtDataFromRequest, getUuidParam } from '../../core/utils'
import * as mutations from '../../domain/mutations'
import { presenter } from '../../domain/presenter'
import * as queries from '../../domain/queries'
import { type RequestAdapter, replier } from '../../lib/http-adapter'
import { mapError } from '../errors/domain'
import { errors } from '../errors/presenter'
import type * as types from '../types'
import { validations } from '../validations'

export async function listServicesAvailable(req: RequestAdapter) {
  const reply = replier<types.api.servicesAvailable.listServicesAvailable.responses>(req)

  // Collect query parameters, path parameters, and request body
  const jwtData = await getJwtDataFromRequest(req)
  if (!jwtData) {
    return reply.fail(errors.invalidToken())
  }

  const query: types.api.servicesAvailable.listServicesAvailable.query = req.getQueryParams()
  const page = getIntParam(query.page, 0)
  const pageSize = getIntParam(query.pageSize, 10)

  // Validate and execute the usecase
  const rows = await queries.queryServiceAvailables({ page, pageSize })

  // Format the response
  return reply.send(200, rows.map(presenter.serviceGroup))
}

export async function createServiceAvailable(req: RequestAdapter) {
  const reply = replier<types.api.servicesAvailable.createServiceAvailable.responses>(req)

  // Collect query parameters, path parameters, and request body
  const jwtData = await getJwtDataFromRequest(req)
  if (!jwtData) {
    return reply.fail(errors.invalidToken())
  }

  const body = await req.getJsonBody()
  const valid = validations.servicesAvailable.createServiceAvailable.body(body)
  if (!valid.ok) {
    return reply.fail(errors.ajv(valid.errors[0]))
  }
  const args: types.api.servicesAvailable.createServiceAvailable.body = valid.value

  if (!args.specialization && !args.specializationId) {
    return reply.fail(errors.missingValue('body', 'specializationId'))
  }

  // Validate and execute the usecase
  const result = await mutations.createServiceAvailable(args)

  if (!result.ok) {
    return reply.fail(mapError(result.error))
  }

  // Format the response
  return reply.send(201, result.value)
}

export async function getServiceAvailableById(req: RequestAdapter) {
  const reply = replier<types.api.servicesAvailable.getServiceAvailableById.responses>(req)

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
  const row = await queries.queryServiceAvailable({ serviceAvailableId: id })

  if (!row) {
    return reply.fail(errors.notFound('service_name'))
  }

  // Format the response
  return reply.send(200, presenter.serviceAvailable(row))
}

export async function updateServiceAvailable(req: RequestAdapter) {
  const reply = replier<types.api.servicesAvailable.updateServiceAvailable.responses>(req)

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
  const valid = validations.servicesAvailable.updateServiceAvailable.body(body)
  if (!valid.ok) {
    return reply.fail(errors.ajv(valid.errors[0]))
  }
  const args: types.api.servicesAvailable.updateServiceAvailable.body = valid.value

  // Validate and execute the usecase
  const result = await mutations.updateServiceAvailable(id, args)

  if (!result.ok) {
    return reply.fail(mapError(result.error))
  }

  // Format the response
  return reply.send(200, result.value)
}

export async function deleteServiceAvailable(req: RequestAdapter) {
  const reply = replier<types.api.servicesAvailable.deleteServiceAvailable.responses>(req)

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
  const result = await mutations.deleteServiceAvailable(id)

  if (!result.ok) {
    return reply.fail(mapError(result.error))
  }

  // Format the response
  return reply.send(204, '')
}
