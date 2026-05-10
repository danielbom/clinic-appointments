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

// datetime

const ISO_DATE_PATTERN = /^\d\d\d\d-\d\d-\d\d$/
const ISO_TIME_PATTERN = /^\d\d:\d\d:\d\d$/

export function parseISODateToUTC(date: string): Date | null {
  if (!ISO_DATE_PATTERN.test(date)) return null
  const result = new Date(date + 'T00:00:00.000Z')
  if (isNaN(result.getTime())) return null
  return result
}

export function parseISOTimeToUTC(time: string): Date | null {
  if (!ISO_TIME_PATTERN.test(time)) return null
  const result = new Date(`2020-01-02T${time}.000Z`)
  if (isNaN(result.getTime())) return null
  return result
}

export function isValidISODate(date: string) {
  return parseISODateToUTC(date) !== null
}

export function isValidISOTime(time: string) {
  return parseISOTimeToUTC(time) !== null
}

// string

export function onlyDigits(text: string): string {
  return text.replace(/\D/g, '')
}

// cnf

const BLACKLIST_CPF = [
  '00000000000',
  '11111111111',
  '22222222222',
  '33333333333',
  '44444444444',
  '55555555555',
  '66666666666',
  '77777777777',
  '88888888888',
  '99999999999',
  '12345678909',
]

export function isValidCpf(cpf: string): boolean {
  if (cpf.length != 11) {
    return false
  }
  for (let i = 0; i < cpf.length; i++) {
    const ch = cpf[i]
    if (!('0' <= ch && ch <= '9')) {
      return false
    }
  }
  if (BLACKLIST_CPF.includes(cpf)) return false
  const Z = 48 // '0'.charCodeAt(0)
  const a0 = cpf.charCodeAt(0) - Z
  const a1 = cpf.charCodeAt(1) - Z
  const a2 = cpf.charCodeAt(2) - Z
  const a3 = cpf.charCodeAt(3) - Z
  const a4 = cpf.charCodeAt(4) - Z
  const a5 = cpf.charCodeAt(5) - Z
  const a6 = cpf.charCodeAt(6) - Z
  const a7 = cpf.charCodeAt(7) - Z
  const a8 = cpf.charCodeAt(8) - Z
  const a9 = cpf.charCodeAt(9) - Z
  const a10 = cpf.charCodeAt(10) - Z
  // prettier-ignore
  const sum9 = a0*10 + a1*9 + a2*8 + a3*7 + a4*6 + a5*5 + a6*4 + a7*3 + a8*2
  // prettier-ignore
  const sum10 = a0*11 + a1*10 + a2*9 + a3*8 + a4*7 + a5*6 + a6*5 + a7*4 + a8*3 + a9*2
  return ((sum9 * 10) % 11) % 10 == a9 && ((sum10 * 10) % 11) % 10 == a10
}

// cnpj

const BLACKLIST_CNPJ = [
  '00000000000000',
  '11111111111111',
  '22222222222222',
  '33333333333333',
  '44444444444444',
  '55555555555555',
  '66666666666666',
  '77777777777777',
  '88888888888888',
  '99999999999999',
]

export function isValidCnpj(cnpj: string): boolean {
  if (cnpj.length !== 14) {
    return false
  }
  for (let i = 0; i < cnpj.length; i++) {
    const ch = cnpj[i]
    if (!('0' <= ch && ch <= '9')) {
      return false
    }
  }
  if (BLACKLIST_CNPJ.includes(cnpj)) return false
  const Z = 48 // '0'.charCodeAt(0)
  const a0 = cnpj.charCodeAt(0) - Z
  const a1 = cnpj.charCodeAt(1) - Z
  const a2 = cnpj.charCodeAt(2) - Z
  const a3 = cnpj.charCodeAt(3) - Z
  const a4 = cnpj.charCodeAt(4) - Z
  const a5 = cnpj.charCodeAt(5) - Z
  const a6 = cnpj.charCodeAt(6) - Z
  const a7 = cnpj.charCodeAt(7) - Z
  const a8 = cnpj.charCodeAt(8) - Z
  const a9 = cnpj.charCodeAt(9) - Z
  const a10 = cnpj.charCodeAt(10) - Z
  const a11 = cnpj.charCodeAt(11) - Z
  const a12 = cnpj.charCodeAt(12) - Z
  const a13 = cnpj.charCodeAt(13) - Z
  // prettier-ignore
  const sum12 = a0*5 + a1*4 + a2*3 + a3*2 + a4*9 + a5*8 + a6*7 + a7*6 + a8*5 + a9*4 + a10*3 + a11*2
  // prettier-ignore
  const sum13 = a0*6 + a1*5 + a2*4 + a3*3 + a4*2 + a5*9 + a6*8 + a7*7 + a8*6 + a9*5 + a10*4 + a11*3 + a12*2
  return ((sum12 * 10) % 11) % 10 == a12 && ((sum13 * 10) % 11) % 10 == a13
}

// email

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email)
}

// phone (Can be simplified with 'libphonenumber-js' library)

const PHONE_PATTERN = /^(?:\+(\d{1,3})\s*)?(?:\((\d{2})\)\s*)?([\d\s-]{8,15})$/

export function parsePhone(phone: string): { countryCode: string; ddd: string; number: string } | null {
  const match = phone.match(PHONE_PATTERN)
  if (!match) return null
  const [, countryCode = '', ddd = '', rawNumber = ''] = match
  const number = rawNumber.replace(/\D/g, '')
  if (number.length < 8 || number.length > 11) return null
  return { countryCode, ddd, number }
}

export function isValidPhone(phone: string): boolean {
  return parsePhone(phone) !== null
}

// extras

export function replier<R extends Record<number, unknown>>(res: Response) {
  type Status = keyof R & number
  return {
    send<K extends Status>(key: K, value: R[K]) {
      res.status(key).send(value)
    },
    fail<T extends { status: Status }>(value: T) {
      const result = {
        ...value,
        instance: res.req.url.toString(),
        traceId: context.get(res.req, 'id'),
      }
      // TODO: console.error(result)
      this.send(value.status, result)
    },
  }
}

export function generateId() {
  return generateUuid()
}
