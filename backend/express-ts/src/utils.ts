import bcrypt from 'bcrypt'
import { Request, Response } from 'express'
import { v7 as generateUuid, validate as isUuid } from 'uuid'
import { extractJwtData, isRefreshToken, verifyJWT } from './jwt'
import { context } from './context'

// assertions
export function assertNotNull<T>(name: string, value: T | undefined | null): T {
  if (value === undefined) throw new Error(`'${name}' is undefined`)
  if (value === null) throw new Error(`'${name}' is null`)
  return value
}

export function assertStringEnum<T extends string>(name: string, value: string | undefined | null, valid: T[]): T {
  if (typeof value !== 'string' || !valid.includes(value as any))
    throw new Error(`'${name}' is not a valid enumerable string: ${valid.map((it) => `'${it}'`).join(', ')}`)
  return value as T
}

// params
export function getStringParam(value: any, defaultValue = ''): string {
  if (typeof value != 'string') return defaultValue
  if (!value) return defaultValue
  return value
}

export function getIntParam(value: any, defaultValue: number): number {
  if (typeof value != 'string') return defaultValue
  if (!value) return defaultValue
  const result = parseInt(value)
  if (isNaN(result)) return defaultValue
  return result
}

export function isValidDate(d: Date): boolean {
  return !isNaN(d.getTime())
}

export function getDateParam(value: any) {
  if (typeof value !== 'string') return null
  const result = new Date(value)
  if (!isValidDate(result)) return null
  return result
}

// parsers
type Brand<T, B> = T & { readonly __brand: B }

export type UUID = Brand<string, 'UUID'>

export function parseUuid(value: unknown): UUID | null {
  if (typeof value != 'string') return null
  if (!isUuid(value)) return null
  return value as UUID
}

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

// password
const saltRounds = 10

export async function hashPassword(password: string) {
  const hash = await bcrypt.hash(password, saltRounds)
  return hash
}

export async function verifyPassword(password: string, hash: string) {
  return await bcrypt.compare(password, hash)
}

// extras
export function replier<R extends Record<number, unknown>>(res: Response) {
  type Status = keyof R & number
  return {
    send<K extends Status>(key: K, value: R[K]) {
      res.status(key).send(value)
    },
    fail<T extends { status: Status }>(value: T) {
      this.send(value.status, {
        ...value,
        instance: res.req.url.toString(),
        traceId: context.get(res.req, 'id'),
      })
    },
  }
}

export function generateId() {
  return generateUuid()
}
