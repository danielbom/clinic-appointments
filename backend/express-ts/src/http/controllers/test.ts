import { getDatabaseConfig } from '../../core/config'
import { verifyJWT } from '../../core/jwt'
import { getAccessTokenFromRequest } from '../../core/utils'
import * as usecases from '../../domain/usecases'
import { type RequestAdapter, replier } from '../../lib/http-adapter'
import { errors } from '../errors/presenter'
import type * as types from '../types'
import { validations } from '../validations'

export async function statsTest(req: RequestAdapter) {
  const reply = replier<types.api.test.statsTest.responses>(req)

  const dbConfig = getDatabaseConfig()

  return reply.send(200, {
    database: `user=${dbConfig.user} password=${dbConfig.password} host=${dbConfig.host} port=${dbConfig.port} dbname=${dbConfig.name}`,
    message: 'Environment: TEST',
  })
}

export async function debugClaimsTest(req: RequestAdapter) {
  const reply = replier<types.api.test.debugClaimsTest.responses>(req)

  const bearerToken = getAccessTokenFromRequest(req)
  const token = bearerToken ? await verifyJWT(bearerToken) : null
  console.log(bearerToken)
  console.log(token)

  return reply.send(200, 'OK')
}

export async function testDispatch(req: RequestAdapter) {
  const reply = replier<types.api.test.testDispatch.responses>(req)

  const body = await req.getJsonBody()
  const valid = validations.test.testDispatch.body(body)
  if (!valid.ok) {
    return reply.fail(errors.ajv(valid.errors[0]))
  }
  const args: types.api.test.testDispatch.body = valid.value

  const result = await usecases.testDispatch(args)

  return reply.send(200, result)
}
