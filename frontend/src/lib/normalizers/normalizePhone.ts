const pattern10: [string, number, number, string][] = [
  ['(', 0, 2, ')'],
  [' ', 2, 6, ''],
  ['-', 6, 10, ''],
]
const pattern11: [string, number, number, string][] = [
  ['(', 0, 2, ') '],
  ['', 2, 3, ' '],
  ['', 3, 7, '-'],
  ['', 7, 11, ''],
]
const RE_DIGIT = /\d/g

export default function normalizePhone(value: string) {
  const digits = (value.match(RE_DIGIT) ?? []).join('')

  const pattern = digits.length <= 10 ? pattern10 : pattern11

  const result: string[] = []
  for (let i = 0; i < pattern.length; i++) {
    const [sep1, start, end, sep2] = pattern[i]
    if (digits.length <= start) break
    if (digits.length <= end) {
      result.push(sep1)
      result.push(digits.slice(start))
      break
    }
    result.push(sep1)
    result.push(digits.slice(start, end))
    result.push(sep2)
  }

  return result.join('')
}
