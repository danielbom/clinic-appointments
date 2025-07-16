import dayjs from 'dayjs'

export default function renderDateHour(date: string, time: string) {
  return dayjs(date).format('DD/MM/YYYY') + ' às ' + time.slice(0, 5)
}
