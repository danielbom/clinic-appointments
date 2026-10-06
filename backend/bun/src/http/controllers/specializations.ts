import { getJwtDataFromRequest, getUuidParam } from '../../core/utils'
import * as mutations from '../../domain/mutations'
import * as queries from '../../domain/queries'
import { type RequestAdapter, replier } from '../../lib/http-adapter'
import { mapError } from '../errors/domain'
import { errors } from '../errors/presenter'
import type * as types from '../types'
import { validations } from '../validations'

export async function listSpecializations(req: RequestAdapter) {
  const reply = replier<types.api.specializations.listSpecializations.responses>(req)

  // Collect query parameters, path parameters, and request body
  const jwtData = await getJwtDataFromRequest(req)
  if (!jwtData) {
    return reply.fail(errors.invalidToken())
  }

  // Validate and execute the usecase
  const rows = await queries.querySpecializations()

  // Format the response
  return reply.send(200, rows)
}

export async function createSpecialization(req: RequestAdapter) {
  const reply = replier<types.api.specializations.createSpecialization.responses>(req)

  // Collect query parameters, path parameters, and request body
  const jwtData = await getJwtDataFromRequest(req)
  if (!jwtData) {
    return reply.fail(errors.invalidToken())
  }

  const body = await req.getJsonBody()
  const valid = validations.specializations.createSpecialization.body(body)
  if (!valid.ok) {
    return reply.fail(errors.ajv(valid.errors[0]))
  }
  const args: types.api.specializations.createSpecialization.body = valid.value

  // Validate and execute the usecase
  const result = await mutations.createSpecialization(args)

  if (!result.ok) {
    return reply.fail(mapError(result.error))
  }

  // Format the response
  return reply.send(201, result.value)
}

export async function updateSpecialization(req: RequestAdapter) {
  const reply = replier<types.api.specializations.updateSpecialization.responses>(req)

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
  const valid = validations.specializations.updateSpecialization.body(body)
  if (!valid.ok) {
    return reply.fail(errors.ajv(valid.errors[0]))
  }
  const args: types.api.specializations.updateSpecialization.body = valid.value

  // Validate and execute the usecase
  const result = await mutations.updateSpecialization(id, args)

  if (!result.ok) {
    return reply.fail(mapError(result.error))
  }

  // Format the response
  return reply.send(200, result.value)
}

export async function deleteSpecialization(req: RequestAdapter) {
  const reply = replier<types.api.specializations.deleteSpecialization.responses>(req)

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
  const result = await mutations.deleteSpecialization(id)

  if (!result.ok) {
    return reply.fail(mapError(result.error))
  }

  // Format the response
  return reply.send(204, '')
}
