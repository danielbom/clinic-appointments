import { db } from './db'

// health
export type DatabaseInfo = {
  version: string
  max_connections: number
  opened_connections: number
  schema_version: number
}

export async function queryDatabaseInfo({ databaseName }: { databaseName: string }) {
  const rows = await db.$queryRaw<DatabaseInfo[]>`SELECT
current_setting('server_version') as version,
current_setting('max_connections')::int as max_connections,
(SELECT count(*)::int FROM pg_stat_activity WHERE datname = ${databaseName}) as opened_connections,
(SELECT version FROM schema_version) as schema_version;`
  return rows[0]
}

// appointments calendar

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

  const rows = await db.$queryRaw<Calendar[]>`
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

  const rows = await db.$queryRaw<CalendarCount[]>`
SELECT date_part('month', "a"."date")::int AS "month"
      , "status", COUNT("a"."id")::int AS "count"
FROM "appointments" "a"
WHERE "a"."date" >= ${startDate}
  AND "a"."date" <= ${endDate}
GROUP BY "month", "status"
ORDER BY "month" ASC;`
  return rows
}

// appointments

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

// customers

export async function queryCustomer({ customerId }: { customerId: string }) {
  const row = await db.customers.findFirst({
    where: { id: customerId },
  })
  return row
}

export async function queryCustomers({
  page,
  pageSize,
  name,
  cpf,
  phone,
}: {
  page: number
  pageSize: number
  name?: string
  cpf?: string
  phone?: string
}) {
  const rows = await db.customers.findMany({
    where: {
      AND: [
        ...(name ? [{ name: { contains: name, mode: 'insensitive' } as const }] : []), //
        ...(cpf ? [{ cpf }] : []), //
        ...(phone ? [{ phone }] : []), //
      ],
    },
    // orderBy: { name: 'asc' },
    take: pageSize,
    skip: page * pageSize,
  })
  return rows
}

export async function queryCustomersCount({ name, cpf, phone }: { name?: string; cpf?: string; phone?: string }) {
  const count = await db.customers.count({
    where: {
      AND: [
        ...(name ? [{ name: { contains: name, mode: 'insensitive' } as const }] : []), //
        ...(cpf ? [{ cpf }] : []), //
        ...(phone ? [{ phone }] : []), //
      ],
    },
  })
  return count
}

// secretaries

export async function querySecretary({ secretaryId }: { secretaryId: string }) {
  const row = await db.secretaries.findFirst({
    where: { id: secretaryId },
  })
  return row
}

export async function querySecretaries({
  page,
  pageSize,
  name,
  cpf,
  cnpj,
  phone,
}: {
  page: number
  pageSize: number
  name?: string
  cpf?: string
  cnpj?: string
  phone?: string
}) {
  const rows = await db.secretaries.findMany({
    where: {
      AND: [
        ...(name ? [{ name: { contains: name, mode: 'insensitive' } as const }] : []), //
        ...(cpf ? [{ cpf }] : []), //
        ...(cnpj ? [{ cnpj }] : []), //
        ...(phone ? [{ phone }] : []), //
      ],
    },
    orderBy: { name: 'asc' },
    take: pageSize,
    skip: page * pageSize,
  })
  return rows
}

export async function querySecretariesCount({
  name,
  cpf,
  cnpj,
  phone,
}: {
  name?: string
  cpf?: string
  cnpj?: string
  phone?: string
}) {
  const count = await db.secretaries.count({
    where: {
      AND: [
        ...(name ? [{ name: { contains: name, mode: 'insensitive' } as const }] : []), //
        ...(cpf ? [{ cpf }] : []), //
        ...(cnpj ? [{ cnpj }] : []), //
        ...(phone ? [{ phone }] : []), //
      ],
    },
  })
  return count
}

// services available

export async function queryServiceAvailable({ serviceAvailableId }: { serviceAvailableId: string }) {
  const row = await db.service_names.findUnique({
    where: { id: serviceAvailableId },
    include: {
      specializations: {},
    },
  })
  return row
}

export async function queryServiceAvailables({ page, pageSize }: { page: number; pageSize: number }) {
  const rows = await db.specializations.findMany({
    orderBy: { name: 'asc' },
    include: {
      service_names: {},
    },
    take: pageSize,
    skip: page * pageSize,
  })
  return rows
}

// services

export async function queryService({ serviceId }: { serviceId: string }) {
  const row = await db.services.findUnique({
    where: { id: serviceId },
  })
  return row
}

export async function queryServices({
  page,
  pageSize,
  service,
  specialist,
  specialization,
}: {
  page: number
  pageSize: number
  service: string
  specialist: string
  specialization: string
}) {
  const rows = await db.services.findMany({
    where: {
      AND: [
        ...(service ? [{ service_names: { name: { contains: service } } } as const] : []), //
        ...(specialist ? [{ specialists: { name: { contains: specialist } } } as const] : []), //
        ...(specialization
          ? [{ service_names: { specializations: { name: { contains: specialization } } } } as const]
          : []), //
      ],
    },
    include: { service_names: { include: { specializations: {} } }, specialists: {} },
    // orderBy: [{ service_names: { specializations: { name: 'desc' } } }, { service_names: { name: 'desc' } }],
    take: pageSize,
    skip: page * pageSize,
  })
  return rows
}

export async function queryServicesCount({
  service,
  specialist,
  specialization,
}: {
  service: string
  specialist: string
  specialization: string
}) {
  const count = await db.services.count({
    where: {
      AND: [
        ...(service ? [{ service_names: { name: { contains: service } } } as const] : []), //
        ...(specialist ? [{ specialists: { name: { contains: specialist } } } as const] : []), //
        ...(specialization
          ? [{ service_names: { specializations: { name: { contains: specialization } } } } as const]
          : []), //
      ],
    },
  })
  return count
}

// service groups

export async function queryServiceGroups() {
  const rows = await db.specializations.findMany({
    include: { service_names: {} },
  })
  return rows
}

// specialists

export async function querySpecialist({ specialistId }: { specialistId: string }) {
  const row = await db.specialists.findUnique({
    where: { id: specialistId },
  })
  return row
}

export async function querySpecialists({
  page,
  pageSize,
  name,
  cpf,
  cnpj,
  phone,
}: {
  page: number
  pageSize: number
  name?: string
  cpf?: string
  cnpj?: string
  phone?: string
}) {
  const rows = await db.specialists.findMany({
    where: {
      AND: [
        ...(name ? [{ name: { contains: name, mode: 'insensitive' } as const }] : []), //
        ...(cpf ? [{ cpf }] : []), //
        ...(cnpj ? [{ cnpj }] : []), //
        ...(phone ? [{ phone }] : []), //
      ],
    },
    orderBy: { name: 'asc' },
    take: pageSize,
    skip: page * pageSize,
  })
  return rows
}

export async function querySpecialistsCount({
  name,
  cpf,
  cnpj,
  phone,
}: {
  name?: string
  cpf?: string
  cnpj?: string
  phone?: string
}) {
  const count = await db.specialists.count({
    where: {
      AND: [
        ...(name ? [{ name: { contains: name, mode: 'insensitive' } as const }] : []), //
        ...(cpf ? [{ cpf }] : []), //
        ...(cnpj ? [{ cnpj }] : []), //
        ...(phone ? [{ phone }] : []), //
      ],
    },
  })
  return count
}

export async function querySpecialistServices({ specialistId }: { specialistId: string }) {
  const rows = await db.services.findMany({
    where: { specialist_id: specialistId },
    include: { service_names: {} },
  })
  return rows
}

export async function querySpecialistSpecializations({ specialistId }: { specialistId: string }) {
  const rows = await db.specializations.findMany({
    where: { service_names: { some: { services: { some: { specialist_id: specialistId } } } } },
  })
  return rows
}

export async function querySpecialistAppointments({
  page,
  pageSize,
  specialistId,
}: {
  page: number
  pageSize: number
  specialistId: string
}) {
  const rows = await db.appointments.findMany({
    where: { specialist_id: specialistId },
    include: { service_names: {}, customers: {} },
    take: pageSize,
    skip: page * pageSize,
  })
  return rows
}

export async function querySpecialistService({ specialistId, serviceId }: { specialistId: string; serviceId: string }) {
  const row = await db.services.findFirst({
    where: { specialist_id: specialistId, service_name_id: serviceId },
  })
  return row
}

// specializations

export async function querySpecializations() {
  const rows = await db.specializations.findMany({
    orderBy: { name: 'asc' },
  })
  return rows
}
