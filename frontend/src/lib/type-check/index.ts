export type TypeCheck<T> = {
  [K in keyof T]: (it: unknown) => boolean
}

export function assertObject<T>(value: unknown, checkKeys: TypeCheck<T>): asserts value is T {
  if (typeof value !== 'object' || value === null) {
    throw new Error(`Invalid root object: ${JSON.stringify(value)}`)
  }
  for (const key in checkKeys) {
    if (!checkKeys[key]((value as any)[key])) {
      throw new Error(`Invalid key ${key}: ${JSON.stringify(value)}`)
    }
  }
}

export function checkObject<T>(value: unknown, checkKeys: TypeCheck<T>): value is T {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  for (const key in checkKeys) {
    if (!checkKeys[key]((value as any)[key])) {
      return false
    }
  }
  return true
}

export function checkObjectStrict<T>(value: unknown, checkKeys: TypeCheck<T>): value is T {
  if (checkObject(value, checkKeys) && allowedKeys(value, checkKeys)) {
    return true
  }
  return false
}

export function checkArray<T>(value: unknown, checkKeys: TypeCheck<T>): value is T[] {
  if (!Array.isArray(value)) {
    return false
  }
  return value.every((item) => checkObject(item, checkKeys))
}

export function allowedKeys<T>(value: T, checkKeys: TypeCheck<T>): boolean {
  for (const key in value) {
    if (!checkKeys[key]) {
      return false
    }
  }
  return true
}

export const is = {
  number: (it: unknown): it is number => typeof it === 'number',
  string: (it: unknown): it is string => typeof it === 'string',
  boolean: (it: unknown): it is boolean => typeof it === 'boolean',
  object: (it: unknown): it is object => typeof it === 'object' && it !== null,
  array: (it: unknown): it is unknown[] => Array.isArray(it),
  nil: (it: unknown): it is null => it === null,
  undefined: (it: unknown): it is undefined => it === undefined,
}
