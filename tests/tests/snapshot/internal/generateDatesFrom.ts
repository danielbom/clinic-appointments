import { addDays } from 'date-fns'

export async function generateDatesFrom(args: { startAt: Date; endAt: Date; consume: (date: Date) => Promise<void> }) {
  let date = args.startAt
  const endAt = args.endAt.getTime()
  while (date.getTime() < endAt) {
    await args.consume(date)
    date = addDays(date, 1)
  }
  return date
}
