import { Request, Response } from 'express'
import { extractJwtData, isRefreshToken, verifyJWT } from './jwt'
import { context } from './lib/context'
import { parseUuid } from './id'

// request
export function getAccessTokenFromRequest(req: Request) {
  const bearer = req.header('authorization')
  if (!bearer) return null
  const prefix = 'Bearer '
  if (!bearer.startsWith(prefix)) return null
  return bearer.slice(prefix.length).trimStart()
}

export async function getJwtDataFromRequest(req: Request) {
  const accessToken = getAccessTokenFromRequest(req)
  if (!accessToken) return null
  const jwtPayload = await verifyJWT(accessToken).catch(() => null)
  if (!jwtPayload) return null
  const jwtData = extractJwtData(jwtPayload)
  if (isRefreshToken(jwtData)) return null
  const userId = parseUuid(jwtData.userId)
  if (!userId) return null
  return jwtData
}
