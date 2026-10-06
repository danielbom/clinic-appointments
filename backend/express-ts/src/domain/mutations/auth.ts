import { parseUuid } from '../../core/id'
import {
  extractJwtData,
  generateAccessJWT,
  generateRefreshJWT,
  isRefreshToken,
  JwtData,
  verifyJWT,
} from '../../core/jwt'
import { verifyPassword } from '../../core/password'
import type { InternalError, InvalidCredentialsError, InvalidTokenError } from '../../http/errors/domain'
import type * as types from '../../http/types'
import type { Res } from '../../lib/res'
import * as queries from '../queries'

export async function login(
  args: types.api.auth.login.body,
  options: { accessTokenExpireIn: number; refreshTokenExpireIn: number },
): Promise<Res<types.schemas.AuthResponse, InvalidCredentialsError>> {
  const identity = await queries.queryIdentity({ email: args.email })
  if (!identity) {
    return { ok: false, error: { kind: 'invalid credentials' } }
  }

  const validPassword = await verifyPassword(args.password, identity.password)
  if (!validPassword) {
    return { ok: false, error: { kind: 'invalid credentials' } }
  }

  const data = new JwtData(identity.id, identity.role)
  const accessToken = generateAccessJWT(data, options.accessTokenExpireIn)
  const refreshToken = generateRefreshJWT(data, options.refreshTokenExpireIn)

  // Format the response
  return { ok: true, value: { accessToken, refreshToken } }
}

export async function refresh({
  refreshToken,
}: {
  refreshToken: string
}): Promise<Res<types.schemas.AuthResponse, InvalidTokenError | InternalError>> {
  const jwtData = await verifyJWT(refreshToken)
    .then(extractJwtData)
    .catch(() => null)
  if (!jwtData || !isRefreshToken(jwtData)) {
    return { ok: false, error: { kind: 'invalid token' } }
  }

  const id = parseUuid(jwtData.userId)
  if (!id) {
    console.error('jwt userId is not an uuid')
    return { ok: false, error: { kind: 'internal', detail: 'jwt userId is not an uuid' } }
  }

  // Validate and execute the usecase
  const identity = await queries.queryIdentity({ userId: id })
  if (!identity) {
    console.error('jwt userId without identity:', id)
    return { ok: false, error: { kind: 'internal', detail: 'jwt userId without identity' } }
  }

  const data = new JwtData(identity.id, identity.role)
  const accessToken = generateAccessJWT(data)

  // Format the response
  return { ok: true, value: { accessToken, refreshToken } }
}
