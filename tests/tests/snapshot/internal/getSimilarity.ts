import levenshtein from 'fast-levenshtein'

export function getSimilarity(a: string, b: string): number {
  const minLength = Math.min(a.length, b.length)
  const distance = levenshtein.get(a.slice(0, minLength), b.slice(0, minLength))
  const maxLength = Math.max(a.length, b.length)

  if (maxLength === 0) return 100

  return (1 - distance / maxLength) * 100
}
