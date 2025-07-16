import dayjs from 'dayjs'

export default function renderAge(value: string) {
  const birthdate = dayjs(value)
  const now = dayjs()
  const age = now.diff(birthdate, 'year')
  return `${age} anos`
}
