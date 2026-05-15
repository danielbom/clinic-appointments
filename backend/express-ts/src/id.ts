import { v7 as generateUuid, validate } from 'uuid'

// parsers
export type Brand<T, B> = T & { readonly __brand: B }

export type UUID = Brand<string, 'UUID'>

export function isUuid(value: unknown): value is UUID {
  return validate(value)
}

export function parseUuid(value: unknown): UUID | null {
  if (!isUuid(value)) return null
  return value
}

export function generateId() {
  return generateUuid()
}
