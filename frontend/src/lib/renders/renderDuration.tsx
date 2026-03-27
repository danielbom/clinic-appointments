export default function renderDuration(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
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
