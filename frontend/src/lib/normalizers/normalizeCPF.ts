const pattern: [number, number, string][] = [
  [0, 3, '.'],
  [3, 6, '.'],
  [6, 9, '-'],
  [9, 11, ''],
]
const RE_DIGIT = /\d/g

export default function normalizeCPF(value: string) {
  const digits = (value.match(RE_DIGIT) ?? []).join('')

  const result: string[] = []
  for (let i = 0; i < pattern.length; i++) {
    const [start, end, separator] = pattern[i]
    if (digits.length < start) break
    if (digits.length <= end) {
      result.push(digits.slice(start))
      break
    }
    result.push(digits.slice(start, end))
    result.push(separator)
  }

  return result.join('')
}
