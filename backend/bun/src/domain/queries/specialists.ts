import { db } from '../../core/db'
import { AppointmentStatus } from '../enums'

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
    orderBy: { email: 'asc' },
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

export async function querySpecialistAppointmentsRealized({
  specialistId,
  startDate,
  endDate,
}: {
  specialistId: string
  startDate: Date
  endDate: Date
}) {
  const rows = await db.appointments.findMany({
    where: {
      specialist_id: specialistId,
      status: AppointmentStatus.Realized,
      AND: [{ date: { gte: startDate } }, { date: { lte: endDate } }],
    },
    include: { service_names: {}, customers: {} },
    orderBy: [{ date: 'asc' }, { time: 'asc' }],
  })
  return rows
}

export async function querySpecialistService({ specialistId, serviceId }: { specialistId: string; serviceId: string }) {
  const row = await db.services.findFirst({
    where: { specialist_id: specialistId, service_name_id: serviceId },
  })
  return row
}
