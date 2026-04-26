export function findInStack(targets: string[]) {
  const stack = new Error().stack
  if (!stack) return '<>'

  const lines = stack.split('\n')

  const result: string[] = []
  for (const line of lines) {
    if (targets.every((target) => line.includes(target))) {
      result.push('- ' + line.trim())
    }
  }

  return result.join('\n')
}
