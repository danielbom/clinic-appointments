import { db } from '../../core/db'
import { parseISODateToUTC, parseISOTimeToUTC } from '../../core/utils'

export async function queryAppointmentIntersects(args: {
  date: string
  time: string
  duration: number
  specialistId: string
}): Promise<boolean> {
  const { duration, specialistId } = args
  const date = parseISODateToUTC(args.date)
  const time = parseISOTimeToUTC(args.time)
  const result = await db.$queryRaw<{ intersects: boolean }[]>`-- name: AppointmentsIntersects :one
SELECT COUNT("date") > 0 AS intersects
FROM "appointments"
WHERE "date" = ${date}
  AND "specialist_id" = ${specialistId}
  AND (
    "time" < ${time}::time + make_interval(mins => ${duration}::integer)
    AND ${time}::time < "time" + make_interval(mins => "duration")
  )
LIMIT 1`
  return result[0]!.intersects
}

export async function queryAppointment({ appointmentId }: { appointmentId: string }) {
  const row = await db.appointments.findFirst({
    include: {
      customers: {},
      service_names: {},
      specialists: {},
    },
    where: { id: appointmentId },
  })
  return row
}

export async function queryAppointments({
  page,
  pageSize,
  startDate,
  endDate,
  serviceName,
  specialist,
  customer,
  status,
}: {
  page: number
  pageSize: number
  startDate?: Date | null
  endDate?: Date | null
  serviceName?: string
  specialist?: string
  customer?: string
  status?: number
}) {
  const rows = await db.appointments.findMany({
    include: {
      customers: {},
      service_names: {},
      specialists: {},
    },
    where: {
      AND: [
        ...(startDate ? [{ date: { gte: startDate } }] : []),
        ...(endDate ? [{ date: { lte: endDate } }] : []),
        ...(serviceName ? [{ service_names: { name: { contains: serviceName, mode: 'insensitive' } } } as const] : []), //
        ...(specialist ? [{ specialists: { name: { contains: specialist, mode: 'insensitive' } } } as const] : []), //
        ...(customer ? [{ customers: { name: { contains: customer, mode: 'insensitive' } } } as const] : []), //
        ...(status ? [{ status }] : []), //
      ],
    },
    orderBy: [{ date: 'desc' }, { time: 'desc' }],
    take: pageSize,
    skip: page * pageSize,
  })
  return rows
}

export async function queryAppointmentsCount({
  startDate,
  endDate,
  serviceName,
  specialist,
  customer,
  status,
}: {
  startDate?: Date | null
  endDate?: Date | null
  serviceName?: string
  specialist?: string
  customer?: string
  status?: number
}) {
  const count = await db.appointments.count({
    where: {
      AND: [
        ...(startDate ? [{ date: { gte: startDate } }] : []),
        ...(endDate ? [{ date: { lte: endDate } }] : []),
        ...(serviceName ? [{ service_names: { name: { contains: serviceName, mode: 'insensitive' } } } as const] : []), //
        ...(specialist ? [{ specialists: { name: { contains: specialist, mode: 'insensitive' } } } as const] : []), //
        ...(customer ? [{ customers: { name: { contains: customer, mode: 'insensitive' } } } as const] : []), //
        ...(status ? [{ status }] : []), //
      ],
    },
  })
  return count
}
