export function uniqConcat<T>(xs: T[] | undefined, y: T | undefined, equals: (a: T, b: T) => boolean): T[] {
  if (typeof y === 'undefined') return xs ?? []
  if (typeof xs === 'undefined') return [y]
  if (xs.find((x) => equals(x, y))) return xs
  return xs.concat([y])
}

export function uniqIdsConcat<T extends { id: any }>(xs: T[] | undefined, y: T | undefined): T[] {
  return uniqConcat(xs, y, (a, b) => a.id === b.id)
}
