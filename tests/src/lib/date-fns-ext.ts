export function getDatePart(isoDate: string): string {
  return isoDate.slice(0, 10)
}

export function getHourPart(isoDate: string): string {
  return isoDate.slice(11, 11 + 8)
}