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
