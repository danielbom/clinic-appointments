import dayjs from 'dayjs'

export default function renderDate(value: string) {
  return dayjs(value).format('DD/MM/YYYY')
}
