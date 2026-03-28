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
  iat?: number // issued at
  exp?: number // expires in
}

export function generateAccessJWT(data: JwtData) {
  const payload: JwtPayload = {
    sub: data.userId,
    role: data.role,
    exp: Date.now() + 10 * 60 * 1000,
    iat: Date.now(),
  }
  return jwt.sign(payload, jwtConfig.secret, {
    algorithm: 'HS256',
  })
}

export function generateRefreshJWT(data: JwtData) {
  const payload: JwtPayload = {
    sub: data.userId,
    role: '',
    exp: Date.now() + 24 * 60 * 60 * 1000,
    iat: Date.now(),
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

export function getJwtData(token: string): Promise<JwtData> {
  return verifyJWT(token).then((payload) => ({ userId: payload.sub, role: payload.role }))
}

export function isRefreshToken(data: JwtData): boolean {
  return data.role === ''
}
