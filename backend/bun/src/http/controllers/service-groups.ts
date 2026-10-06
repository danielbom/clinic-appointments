import { getJwtDataFromRequest } from '../../core/utils'
import { presenter } from '../../domain/presenter'
import * as queries from '../../domain/queries'
import { type RequestAdapter, replier } from '../../lib/http-adapter'
import { errors } from '../errors/presenter'
import type * as types from '../types'

export async function listServiceGroups(req: RequestAdapter) {
  const reply = replier<types.api.serviceGroups.listServiceGroups.responses>(req)

  // Collect query parameters, path parameters, and request body
  const jwtData = await getJwtDataFromRequest(req)
  if (!jwtData) {
    return reply.fail(errors.invalidToken())
  }

  // Validate and execute the usecase
  const rows = await queries.queryServiceGroups()

  // Format the response
  return reply.send(200, rows.map(presenter.serviceGroup))
}
