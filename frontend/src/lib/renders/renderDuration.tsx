export default function renderDuration(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const parts = []
  if (hours > 0) {
    parts.push(`${hours}h`)
  }
  if (minutes > 0) {
    parts.push(`${minutes % 60}m`)
  }
  if (parts.length === 0) {
    parts.push('0m')
  }
  return parts.join(' ')
}
