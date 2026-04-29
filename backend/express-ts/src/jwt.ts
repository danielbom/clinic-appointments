import jwt from 'jsonwebtoken'
import { getJwtConfig } from './config'

const jwtConfig = getJwtConfig()

export type JwtData = {
  userId: string
  role: string
}

interface JwtPayload {
  sub: string // subject
  role: string
  iat?: number // issued at in seconds
  exp?: number // expires in in seconds -> TokenExpiredError
  nbf?: number // not before in seconds -> NotBeforeError
}

export function generateAccessJWT(data: JwtData, exp = 0) {
  const now = Math.floor(Date.now() / 1000)
  const payload: JwtPayload = {
    sub: data.userId,
    role: data.role,
    exp: now + (exp || 10 * 60),
    iat: now,
  }
  return jwt.sign(payload, jwtConfig.secret, {
    algorithm: 'HS256',
  })
}

export function generateRefreshJWT(data: JwtData, exp = 0) {
  const now = Math.floor(Date.now() / 1000)
  const payload: JwtPayload = {
    sub: data.userId,
    role: '',
    exp: now + (exp || 24 * 60 * 60),
    iat: now,
  }
  return jwt.sign(payload, jwtConfig.secret, {
    algorithm: 'HS256',
  })
}

export function verifyJWT(token: string): Promise<JwtPayload> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, jwtConfig.secret, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return reject(new Error('JWT expired'))
        }

        if (err.name === 'JsonWebTokenError') {
          return reject(new Error('Invalid JWT'))
        }

        return reject(err)
      }

      resolve(decoded as JwtPayload)
    })
  })
}

export function extractJwtData(payload: JwtPayload): JwtData {
  return { userId: payload.sub, role: payload.role }
}

export function isRefreshToken(data: JwtData): boolean {
  return data.role === ''
}
