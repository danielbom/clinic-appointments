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
