import { getIntParam, getJwtDataFromRequest, getStringParam, getUuidParam } from '../../core/utils'
import * as mutations from '../../domain/mutations'
import { presenter } from '../../domain/presenter'
import * as queries from '../../domain/queries'
import { type RequestAdapter, replier } from '../../lib/http-adapter'
import { mapError } from '../errors/domain'
import { errors } from '../errors/presenter'
import type * as types from '../types'
import { validations } from '../validations'

export async function listSecretaries(req: RequestAdapter) {
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

  // Validate and execute the usecase
  const rows = await queries.querySecretaries({ page, pageSize, name, cpf, cnpj, phone })

  // Format the response
  return reply.send(200, rows.map(presenter.secretary))
}

export async function createSecretary(req: RequestAdapter) {
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
  const valid = validations.secretaries.createSecretary.body(body)
  if (!valid.ok) {
    return reply.fail(errors.ajv(valid.errors[0]))
  }
  const args: types.api.secretaries.createSecretary.body = valid.value

  // Validate and execute the usecase
  const result = await mutations.createSecretary(args)

  if (!result.ok) {
    return reply.fail(mapError(result.error))
  }

  // Format the response
  return reply.send(201, result.value)
}

export async function countSecretaries(req: RequestAdapter) {
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

  // Validate and execute the usecase
  const count = await queries.querySecretariesCount({ name, cpf, cnpj, phone })

  // Format the response
  return reply.send(200, count)
}

export async function getSecretaryById(req: RequestAdapter) {
  const reply = replier<types.api.secretaries.getSecretaryById.responses>(req)

  // Collect query parameters, path parameters, and request body
  const jwtData = await getJwtDataFromRequest(req)
  if (!jwtData) {
    return reply.fail(errors.invalidToken())
  }
  if (!jwtData.hasAccess('secretary')) {
    return reply.fail(errors.invalidAccess('Role without access'))
  }

  const id = getUuidParam(req.getPathParam('id'))
  if (!id) {
    return reply.fail(errors.validation('path', 'id', 'invalid uuid'))
  }
  if (jwtData.role === 'secretary' && jwtData.userId !== id) {
    return reply.fail(errors.invalidAccess('User without access'))
  }

  // Validate and execute the usecase
  const row = await queries.querySecretary({ secretaryId: id })

  if (!row) {
    return reply.fail(errors.notFound('secretary'))
  }

  // Format the response
  return reply.send(200, presenter.secretary(row))
}

export async function updateSecretary(req: RequestAdapter) {
  const reply = replier<types.api.secretaries.updateSecretary.responses>(req)

  // Collect query parameters, path parameters, and request body
  const jwtData = await getJwtDataFromRequest(req)
  if (!jwtData) {
    return reply.fail(errors.invalidToken())
  }
  if (!jwtData.hasAccess('secretary')) {
    return reply.fail(errors.invalidAccess('Role without access'))
  }

  const id = getUuidParam(req.getPathParam('id'))
  if (!id) {
    return reply.fail(errors.validation('path', 'id', 'invalid uuid'))
  }
  if (jwtData.role === 'secretary' && jwtData.userId !== id) {
    return reply.fail(errors.invalidAccess('User without access'))
  }

  const body = await req.getJsonBody()
  const valid = validations.secretaries.updateSecretary.body(body)
  if (!valid.ok) {
    return reply.fail(errors.ajv(valid.errors[0]))
  }
  const args: types.api.secretaries.updateSecretary.body = valid.value

  // Validate and execute the usecase
  const result = await mutations.updateSecretary(id, args)

  if (!result.ok) {
    return reply.fail(mapError(result.error))
  }

  // Format the response
  return reply.send(200, result.value)
}

export async function deleteSecretary(req: RequestAdapter) {
  const reply = replier<types.api.secretaries.deleteSecretary.responses>(req)

  // Collect query parameters, path parameters, and request body
  const jwtData = await getJwtDataFromRequest(req)
  if (!jwtData) {
    return reply.fail(errors.invalidToken())
  }
  if (!jwtData.hasAccess()) {
    return reply.fail(errors.invalidAccess('Role without access'))
  }

  const id = getUuidParam(req.getPathParam('id'))
  if (!id) {
    return reply.fail(errors.validation('path', 'id', 'invalid uuid'))
  }

  // Validate and execute the usecase
  const result = await mutations.deleteSecretary(id)

  if (!result.ok) {
    return reply.fail(mapError(result.error))
  }

  // Format the response
  return reply.send(204, '')
}
