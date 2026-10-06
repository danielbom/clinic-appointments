import { db } from '../../core/db'

export type Calendar = {
  id: string
  date: Date
  time: Date
  status: number
  specialist_name: string
}

export async function queryAppointmentsCalendar({ startDate, endDate }: { startDate: Date; endDate: Date }) {
  // -- Just with client.previewFeatures = ["relationJoins"] enabled
  // const row = await dbLog.appointments.findMany({
  //   relationLoadStrategy: 'join',
  //   select: {
  //     id: true,
  //     date: true,
  //     time: true,
  //     status: true,
  //     specialists: { select: { name: true } },
  //   },
  //   where: {
  //     AND: [
  //       { date: { gt: startDate } }, //
  //       { date: { lt: endDate } }, //
  //     ],
  //   },
  //   orderBy: [{ date: 'desc' }, { time: 'desc' }],
  // })

  const rows = await db.$queryRaw<Calendar[]>`-- name: ListAppointmentsCalendar :many
SELECT "a"."id", "a"."date", "a"."time", "a"."status", "s"."name" AS "specialist_name"
FROM "appointments" "a"
JOIN "specialists" "s" ON "a"."specialist_id" = "s"."id"
WHERE "a"."date" >= ${startDate} AND "a"."date" <= ${endDate}
ORDER BY "a"."date" DESC, "a"."time" DESC`
  return rows
}

export type CalendarCount = {
  month: number
  status: number
  count: number
}

export async function queryAppointmentsCalendarCount({ startDate, endDate }: { startDate: Date; endDate: Date }) {
  // const appointmentsCount = await db.appointments.groupBy({
  //   where: {
  //     AND: [
  //       { date: { gt: startDate } }, //
  //       { date: { lt: endDate } }, //
  //     ],
  //   },
  //   by: ['date', 'status'],
  //   _count: { status: true },
  // })

  const rows = await db.$queryRaw<CalendarCount[]>`-- name: ListAppointmentsCalendarCount :many
SELECT date_part('month', "a"."date")::int AS "month"
      , "status", COUNT("a"."id")::int AS "count"
FROM "appointments" "a"
WHERE "a"."date" >= ${startDate}
  AND "a"."date" <= ${endDate}
GROUP BY "month", "status"
ORDER BY "month" ASC;`
  return rows
}
