import { getAppConfig } from '../../core/config'
import { getAccessTokenFromRequest, getIntParam, getJwtDataFromRequest } from '../../core/utils'
import * as mutations from '../../domain/mutations'
import { presenter } from '../../domain/presenter'
import * as queries from '../../domain/queries'
import { type RequestAdapter, type ResponseAdapter, replier } from '../../lib/http-adapter'
import { mapError } from '../errors/domain'
import { errors } from '../errors/presenter'
import type * as types from '../types'
import { validations } from '../validations'

export async function login(req: RequestAdapter): Promise<ResponseAdapter> {
  const reply = replier<types.api.auth.login.responses>(req)

  const appConfig = getAppConfig()

  const validEnvironments: Array<typeof appConfig.environment> = ['development', 'test']
  let accessTokenExpireIn = 0
  let refreshTokenExpireIn = 0
  if (validEnvironments.includes(appConfig.environment)) {
    accessTokenExpireIn = getIntParam(req.getHeader('x-access-token-expires-in'), 0)
    refreshTokenExpireIn = getIntParam(req.getHeader('x-refresh-token-expires-in'), 0)
  }

  // Collect query parameters, path parameters, and request body
  const body = await req.getJsonBody()
  const valid = validations.auth.login.body(body)
  if (!valid.ok) {
    return reply.fail(errors.ajv(valid.errors[0]))
  }
  const args: types.api.auth.login.body = valid.value

  // Validate and execute the usecase
  const result = await mutations.login(args, { accessTokenExpireIn, refreshTokenExpireIn })

  if (!result.ok) {
    return reply.fail(mapError(result.error))
  }

  // Format the response
  return reply.send(200, result.value)
}

export async function refresh(req: RequestAdapter) {
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
}

export async function me(req: RequestAdapter) {
  const reply = replier<types.api.auth.me.responses>(req)

  // Collect query parameters, path parameters, and request body
  const jwtData = await getJwtDataFromRequest(req)
  if (!jwtData) {
    return reply.fail(errors.invalidToken())
  }

  // Validate and execute the usecase
  const identity = await queries.queryIdentity({ userId: jwtData.userId })
  if (!identity) {
    console.error('jwt userId without identity:', jwtData.userId)
    return reply.fail(errors.invalidToken())
  }

  // Format the response
  return reply.send(200, presenter.identity(identity))
}
