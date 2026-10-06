import { db } from '../../core/db'
import { generateId, type UUID } from '../../core/id'
import { parseISODateToUTC, parseISOTimeToUTC } from '../../core/utils'
import type { InvalidStateTransitionError, NotFoundError, ScheduleConflictError } from '../../http/errors/domain'
import type * as types from '../../http/types'
import type { Res } from '../../lib/res'
import { AppointmentStatus } from '../enums'
import { queryAppointmentIntersects } from '../queries'

export async function createAppointment(
  args: types.api.appointments.createAppointment.body,
): Promise<Res<types.schemas.Id, NotFoundError | ScheduleConflictError>> {
  const service = await db.services.findUnique({
    where: { id: args.serviceId },
  })

  if (!service) {
    return { ok: false, error: { kind: 'not found', resource: 'service' } }
  }

  const appointmentsIntersects = await queryAppointmentIntersects({
    date: args.date,
    time: args.time,
    duration: service.duration,
    specialistId: service.specialist_id,
  })

  if (appointmentsIntersects) {
    return { ok: false, error: { kind: 'schedule conflict', resource: 'appointment', key: 'date,time' } }
  }

  const row = await db.appointments.create({
    data: {
      id: generateId(),
      date: parseISODateToUTC(args.date)!,
      time: parseISOTimeToUTC(args.time)!,
      duration: service.duration,
      price: service.price,
      customer_id: args.customerId,
      service_name_id: service.service_name_id,
      specialist_id: service.specialist_id,
      status: AppointmentStatus.Pending,
    },
  })

  return { ok: true, value: { id: row.id } }
}

export async function updateAppointment(
  appointmentId: UUID,
  args: types.api.appointments.updateAppointment.body,
): Promise<Res<types.schemas.Id, ScheduleConflictError | NotFoundError>> {
  const row = await db.appointments.findFirst({
    where: { id: appointmentId },
  })
  if (!row) {
    return { ok: false, error: { kind: 'not found', resource: 'appointment' } }
  }

  const appointmentsIntersects = await queryAppointmentIntersects({
    date: args.date,
    time: args.time,
    duration: row.duration,
    specialistId: row.specialist_id,
  })

  if (appointmentsIntersects) {
    return { ok: false, error: { kind: 'schedule conflict', resource: 'appointment', key: 'date,time' } }
  }

  await db.appointments.update({
    where: { id: appointmentId },
    data: {
      date: parseISODateToUTC(args.date)!,
      time: parseISOTimeToUTC(args.time)!,
    },
  })

  return { ok: true, value: { id: row.id } }
}

async function appointmentChangeStatus(
  appointmentId: UUID,
  newStatus: number,
): Promise<Res<types.schemas.Id, InvalidStateTransitionError | NotFoundError>> {
  const row = await db.appointments.findFirst({
    where: { id: appointmentId },
  })
  if (!row) {
    return { ok: false, error: { kind: 'not found', resource: 'appointment' } }
  }

  if (row.status !== AppointmentStatus.Pending) {
    return {
      ok: false,
      error: {
        kind: 'invalid state transition',
        resource: 'appointment',
        from: AppointmentStatus.toString(row.status),
        to: AppointmentStatus.toString(newStatus),
      },
    }
  }

  await db.appointments.update({
    where: { id: appointmentId },
    data: {
      status: newStatus,
    },
  })

  return { ok: true, value: { id: row.id } }
}

export async function appointmentRealized(
  appointmentId: UUID,
): Promise<Res<types.schemas.Id, InvalidStateTransitionError | NotFoundError>> {
  return appointmentChangeStatus(appointmentId, AppointmentStatus.Realized)
}

export async function appointmentCanceled(
  appointmentId: UUID,
): Promise<Res<types.schemas.Id, InvalidStateTransitionError | NotFoundError>> {
  return appointmentChangeStatus(appointmentId, AppointmentStatus.Canceled)
}

export async function deleteAppointment(appointmentId: UUID): Promise<Res<types.schemas.Id, NotFoundError>> {
  const row = await db.appointments.delete({
    where: { id: appointmentId },
  })
  if (!row) {
    return { ok: false, error: { kind: 'not found', resource: 'appointment' } }
  }
  return { ok: true, value: { id: row.id } }
}
