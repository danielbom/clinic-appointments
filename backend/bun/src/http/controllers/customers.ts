import { getIntParam, getJwtDataFromRequest, getStringParam, getUuidParam } from '../../core/utils'
import * as mutations from '../../domain/mutations'
import { presenter } from '../../domain/presenter'
import * as queries from '../../domain/queries'
import { type RequestAdapter, replier } from '../../lib/http-adapter'
import { mapError } from '../errors/domain'
import { errors } from '../errors/presenter'
import type * as types from '../types'
import { validations } from '../validations'

export async function listCustomers(req: RequestAdapter) {
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

  // Validate and execute the usecase
  const rows = await queries.queryCustomers({ page, pageSize, name, cpf, phone })

  // Format the response
  return reply.send(200, rows.map(presenter.customer))
}

export async function createCustomer(req: RequestAdapter) {
  const reply = replier<types.api.customers.createCustomer.responses>(req)

  // Collect query parameters, path parameters, and request body
  const jwtData = await getJwtDataFromRequest(req)
  if (!jwtData) {
    return reply.fail(errors.invalidToken())
  }

  const body = await req.getJsonBody()
  const valid = validations.customers.createCustomer.body(body)
  if (!valid.ok) {
    return reply.fail(errors.ajv(valid.errors[0]))
  }
  const args: types.api.customers.createCustomer.body = valid.value

  // Validate and execute the usecase
  const result = await mutations.createCustomer(args)

  if (!result.ok) {
    return reply.fail(mapError(result.error))
  }

  // Format the response
  return reply.send(201, result.value)
}

export async function countCustomers(req: RequestAdapter) {
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

  // Validate and execute the usecase
  const count = await queries.queryCustomersCount({ name, cpf, phone })

  // Format the response
  return reply.send(200, count)
}

export async function getCustomerById(req: RequestAdapter) {
  const reply = replier<types.api.customers.getCustomerById.responses>(req)

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
  const row = await queries.queryCustomer({ customerId: id })

  if (!row) {
    return reply.fail(errors.notFound('customer'))
  }

  // Format the response
  return reply.send(200, presenter.customer(row))
}

export async function updateCustomer(req: RequestAdapter) {
  const reply = replier<types.api.customers.updateCustomer.responses>(req)

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
  const valid = validations.customers.updateCustomer.body(body)
  if (!valid.ok) {
    return reply.fail(errors.ajv(valid.errors[0]))
  }
  const args: types.api.customers.updateCustomer.body = valid.value

  // Validate and execute the usecase
  const result = await mutations.updateCustomer(id, args)

  if (!result.ok) {
    return reply.fail(mapError(result.error))
  }

  // Format the response
  return reply.send(200, result.value)
}

export async function deleteCustomer(req: RequestAdapter) {
  const reply = replier<types.api.customers.deleteCustomer.responses>(req)

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
  const result = await mutations.deleteCustomer(id)

  if (!result.ok) {
    return reply.fail(mapError(result.error))
  }

  // Format the response
  return reply.send(204, '')
}
