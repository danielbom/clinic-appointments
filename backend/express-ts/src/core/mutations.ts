import type * as types from './swagger-types'
import { AppointmentStatus } from './presenter'
import { queryAppointmentIntersects, queryIdentity } from './queries'
import { parseISODateToUTC, parseISOTimeToUTC } from './utils'

import { type UUID, generateId, parseUuid } from '../id'
import { db } from '../db'
import { hashPassword, verifyPassword } from '../password'
import { extractJwtData, generateAccessJWT, generateRefreshJWT, isRefreshToken, JwtData, verifyJWT } from '../jwt'

type Res<TOk, TError> = { ok: true; value: TOk } | { ok: false; error: TError }

type Id = { id: string }
type Resource = 'appointment' | 'customer' | 'service' | 'secretary' | 'service_name' | 'specialization' | 'specialist'
export type InvalidCredentialsError = { kind: 'invalid credentials' }
export type InvalidTokenError = { kind: 'invalid token' }
export type NotFoundError = { kind: 'not found'; resource: Resource }
export type AlreadyExistsError = { kind: 'already exists'; resource: Resource; key: string }
export type ScheduleConflictError = { kind: 'schedule conflict'; resource: Resource; key: string }
export type InternalError = { kind: 'internal'; detail: string }

// auth

export async function login(
  args: types.api.auth.login.body,
  options: { accessTokenExpireIn: number; refreshTokenExpireIn: number },
): Promise<Res<types.schemas.AuthResponse, InvalidCredentialsError>> {
  const identity = await queryIdentity({ email: args.email })
  if (!identity) {
    return { ok: false, error: { kind: 'invalid credentials' } }
  }

  const validPassword = await verifyPassword(args.password, identity.password)
  if (!validPassword) {
    return { ok: false, error: { kind: 'invalid credentials' } }
  }

  const data = new JwtData(identity.id, identity.role)
  const accessToken = generateAccessJWT(data, options.accessTokenExpireIn)
  const refreshToken = generateRefreshJWT(data, options.refreshTokenExpireIn)

  // Format the response
  return { ok: true, value: { accessToken, refreshToken } }
}

export async function refresh({
  refreshToken,
}: {
  refreshToken: string
}): Promise<Res<types.schemas.AuthResponse, InvalidTokenError | InternalError>> {
  const jwtData = await verifyJWT(refreshToken)
    .then(extractJwtData)
    .catch(() => null)
  if (!jwtData || !isRefreshToken(jwtData)) {
    return { ok: false, error: { kind: 'invalid token' } }
  }

  const id = parseUuid(jwtData.userId)
  if (!id) {
    console.error('jwt userId is not an uuid')
    return { ok: false, error: { kind: 'internal', detail: 'jwt userId is not an uuid' } }
  }

  // Validate e execute the usecase
  const identity = await queryIdentity({ userId: id })
  if (!identity) {
    console.error('jwt userId without identity:', id)
    return { ok: false, error: { kind: 'internal', detail: 'jwt userId without identity' } }
  }

  const data = new JwtData(identity.id, identity.role)
  const accessToken = generateAccessJWT(data)

  // Format the response
  return { ok: true, value: { accessToken, refreshToken } }
}

// appointments

export async function createAppointment(
  args: types.api.appointments.createAppointment.body,
): Promise<Res<Id, NotFoundError | ScheduleConflictError>> {
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
): Promise<Res<Id, ScheduleConflictError | NotFoundError>> {
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
      status: args.status,
    },
  })

  return { ok: true, value: { id: row.id } }
}

export async function deleteAppointment(appointmentId: UUID): Promise<Res<Id, NotFoundError>> {
  const row = await db.appointments.delete({
    where: { id: appointmentId },
  })
  if (!row) {
    return { ok: false, error: { kind: 'not found', resource: 'appointment' } }
  }
  return { ok: true, value: { id: row.id } }
}

// customers

export async function createCustomer(
  args: types.api.customers.createCustomer.body,
): Promise<Res<Id, AlreadyExistsError>> {
  const exists = await db.customers.findUnique({
    where: { phone: args.phone },
  })

  if (exists) {
    return { ok: false, error: { kind: 'already exists', resource: 'customer', key: 'phone' } }
  }

  const row = await db.customers.create({
    data: {
      id: generateId(),
      birthdate: parseISODateToUTC(args.birthdate)!,
      cpf: args.cpf,
      email: args.email,
      name: args.name,
      phone: args.phone,
    },
  })
  return { ok: true, value: { id: row.id } }
}

export async function updateCustomer(
  customerId: UUID,
  args: types.api.customers.updateCustomer.body,
): Promise<Res<Id, AlreadyExistsError | NotFoundError>> {
  const exists = await db.customers.findUnique({
    where: { phone: args.phone },
  })

  if (exists && exists.id !== customerId) {
    return { ok: false, error: { kind: 'already exists', resource: 'customer', key: 'phone' } }
  }

  const row = await db.customers.update({
    where: { id: customerId },
    data: {
      name: args.name,
      email: args.email,
      phone: args.phone,
      birthdate: parseISODateToUTC(args.birthdate)!,
      cpf: args.cpf,
    },
  })

  if (!row) {
    return { ok: false, error: { kind: 'not found', resource: 'customer' } }
  }

  return { ok: true, value: { id: row.id } }
}

export async function deleteCustomer(customerId: UUID): Promise<Res<Id, NotFoundError>> {
  const row = await db.customers.delete({
    where: { id: customerId },
  })
  if (!row) {
    return { ok: false, error: { kind: 'not found', resource: 'customer' } }
  }
  return { ok: true, value: { id: row.id } }
}

// secretaries

export async function createSecretary(
  args: types.api.secretaries.createSecretary.body,
): Promise<Res<Id, AlreadyExistsError>> {
  const exists = await db.secretaries.findUnique({
    where: { email: args.email },
  })

  if (exists) {
    return { ok: false, error: { kind: 'already exists', resource: 'secretary', key: 'email' } }
  }

  const row = await db.secretaries.create({
    data: {
      id: generateId(),
      birthdate: parseISODateToUTC(args.birthdate)!,
      cpf: args.cpf,
      email: args.email,
      name: args.name,
      password: await hashPassword(args.password),
      phone: args.phone,
      cnpj: args.cnpj,
    },
  })

  return { ok: true, value: { id: row.id } }
}

export async function updateSecretary(
  secretaryId: UUID,
  args: types.api.secretaries.updateSecretary.body,
): Promise<Res<Id, AlreadyExistsError | NotFoundError>> {
  const exists = await db.secretaries.findUnique({
    where: { email: args.email },
  })

  if (exists && exists.id !== secretaryId) {
    return { ok: false, error: { kind: 'already exists', resource: 'secretary', key: 'email' } }
  }

  const row = await db.secretaries.update({
    where: { id: secretaryId },
    data: {
      name: args.name,
      email: args.email,
      phone: args.phone,
      birthdate: parseISODateToUTC(args.birthdate)!,
      cpf: args.cpf,
      cnpj: args.cnpj,
      password: args.password ? await hashPassword(args.password) : undefined,
    },
  })

  if (!row) {
    return { ok: false, error: { kind: 'not found', resource: 'secretary' } }
  }

  return { ok: true, value: { id: row.id } }
}

export async function deleteSecretary(secretaryId: UUID): Promise<Res<Id, NotFoundError>> {
  const row = await db.secretaries.delete({
    where: { id: secretaryId },
  })
  if (!row) {
    return { ok: false, error: { kind: 'not found', resource: 'secretary' } }
  }
  return { ok: true, value: { id: row.id } }
}

// servicesAvailable

export async function createServiceAvailable(
  args: types.api.servicesAvailable.createServiceAvailable.body,
): Promise<Res<Id, AlreadyExistsError | NotFoundError>> {
  if (args.specialization && !args.specializationId) {
    let specialization = await db.specializations.findUnique({
      where: { name: args.specialization },
    })

    if (!specialization) {
      specialization = await db.specializations.create({
        data: {
          name: args.specialization,
        },
      })
    }

    args.specializationId = specialization.id
  }

  {
    const exists = await db.specializations.findUnique({
      where: { id: args.specializationId },
    })

    if (!exists) {
      return { ok: false, error: { kind: 'not found', resource: 'specialization' } }
    }
  }

  const exists = await db.service_names.findUnique({
    where: { name: args.name },
  })

  if (exists) {
    return { ok: false, error: { kind: 'already exists', resource: 'service_name', key: 'name' } }
  }

  const row = await db.service_names.create({
    data: {
      id: generateId(),
      name: args.name,
      specialization_id: args.specializationId!,
    },
  })

  return { ok: true, value: { id: row.id } }
}

export async function updateServiceAvailable(
  serviceAvailableId: UUID,
  args: types.api.servicesAvailable.updateServiceAvailable.body,
): Promise<Res<Id, AlreadyExistsError | NotFoundError>> {
  const exists = await db.service_names.findUnique({
    where: { name: args.name },
  })

  if (exists && exists.id !== serviceAvailableId) {
    return { ok: false, error: { kind: 'already exists', resource: 'service_name', key: 'name' } }
  }

  const row = await db.service_names.update({
    where: { id: serviceAvailableId },
    data: { name: args.name },
  })

  if (!row) {
    return { ok: false, error: { kind: 'not found', resource: 'service_name' } }
  }

  return { ok: true, value: { id: row.id } }
}

export async function deleteServiceAvailable(serviceAvailableId: UUID): Promise<Res<Id, NotFoundError>> {
  const row = await db.service_names.delete({
    where: { id: serviceAvailableId },
  })
  if (!row) {
    return { ok: false, error: { kind: 'not found', resource: 'service_name' } }
  }
  return { ok: true, value: { id: row.id } }
}

// services

export async function createService(args: types.api.services.createService.body): Promise<Res<Id, AlreadyExistsError>> {
  const exists = await db.services.findUnique({
    where: {
      service_name_id_specialist_id: {
        service_name_id: args.serviceNameId,
        specialist_id: args.specialistId,
      },
    },
  })

  if (exists) {
    return { ok: false, error: { kind: 'already exists', resource: 'service', key: 'specialist_id,service_name_id' } }
  }

  const row = await db.services.create({
    data: {
      id: generateId(),
      service_name_id: args.serviceNameId,
      specialist_id: args.specialistId,
      price: args.price,
      duration: args.duration,
    },
  })
  return { ok: true, value: { id: row.id } }
}

export async function updateService(
  serviceId: UUID,
  args: types.api.services.updateService.body,
): Promise<Res<Id, NotFoundError>> {
  const row = await db.services.update({
    where: { id: serviceId },
    data: {
      duration: args.duration,
      price: args.price,
    },
  })

  if (!row) {
    return { ok: false, error: { kind: 'not found', resource: 'specialization' } }
  }

  return { ok: true, value: { id: row.id } }
}

export async function deleteService(serviceId: UUID): Promise<Res<Id, NotFoundError>> {
  const row = await db.services.delete({
    where: { id: serviceId },
  })
  if (!row) {
    return { ok: false, error: { kind: 'not found', resource: 'service' } }
  }
  return { ok: true, value: { id: row.id } }
}

// specialists

export async function createSpecialist(
  args: types.api.specialists.createSpecialist.body,
): Promise<Res<Id, AlreadyExistsError | NotFoundError>> {
  const exists = await db.specialists.findUnique({
    where: { email: args.email },
  })

  if (exists) {
    return { ok: false, error: { kind: 'already exists', resource: 'specialist', key: 'email' } }
  }

  if (args.services.length > 0) {
    const serviceNamesCount = await db.service_names.count({
      where: { id: { in: args.services.map((s) => s.serviceNameId) } },
    })

    if (serviceNamesCount !== args.services.length) {
      return { ok: false, error: { kind: 'not found', resource: 'service_name' } }
    }
  }

  const row = await db.$transaction(async (tx) => {
    const row = await tx.specialists.create({
      data: {
        id: generateId(),
        birthdate: parseISODateToUTC(args.birthdate)!,
        cpf: args.cpf,
        email: args.email,
        name: args.name,
        phone: args.phone,
        cnpj: args.cnpj,
      },
    })

    await tx.services.createMany({
      data: args.services.map((s) => ({
        id: generateId(),
        service_name_id: s.serviceNameId,
        price: s.price,
        duration: s.duration,
        specialist_id: row.id,
      })),
    })

    return row
  })

  return { ok: true, value: { id: row.id } }
}

export async function updateSpecialist(
  specialistId: UUID,
  args: types.api.specialists.updateSpecialist.body,
): Promise<Res<Id, AlreadyExistsError | NotFoundError>> {
  const exists = await db.specialists.findUnique({
    where: { email: args.email },
  })

  if (exists && exists.id !== specialistId) {
    return { ok: false, error: { kind: 'already exists', resource: 'specialist', key: 'email' } }
  }

  const row = await db.specialists.update({
    where: { id: specialistId },
    data: {
      birthdate: parseISODateToUTC(args.birthdate)!,
      cpf: args.cpf,
      email: args.email,
      name: args.name,
      phone: args.phone,
      cnpj: args.cnpj,
    },
  })

  if (!row) {
    return { ok: false, error: { kind: 'not found', resource: 'specialization' } }
  }

  return { ok: true, value: { id: row.id } }
}

export async function deleteSpecialist(specialistId: UUID): Promise<Res<Id, NotFoundError>> {
  const row = await db.specialists.delete({
    where: { id: specialistId },
  })
  if (!row) {
    return { ok: false, error: { kind: 'not found', resource: 'specialist' } }
  }
  return { ok: true, value: { id: row.id } }
}

// specializations

export async function createSpecialization(
  args: types.api.specializations.createSpecialization.body,
): Promise<Res<Id, AlreadyExistsError>> {
  const exists = await db.specializations.findUnique({
    where: { name: args.name },
  })

  if (exists) {
    return { ok: false, error: { kind: 'already exists', resource: 'specialization', key: 'name' } }
  }

  const row = await db.specializations.create({
    data: {
      id: generateId(),
      name: args.name,
    },
  })

  return { ok: true, value: { id: row.id } }
}

export async function updateSpecialization(
  specializationId: UUID,
  args: types.api.specializations.updateSpecialization.body,
): Promise<Res<Id, AlreadyExistsError | NotFoundError>> {
  const exists = await db.specializations.findUnique({
    where: { name: args.name },
  })

  if (exists && exists.id !== specializationId) {
    return { ok: false, error: { kind: 'already exists', resource: 'specialization', key: 'name' } }
  }

  const row = await db.specializations.update({
    where: { id: specializationId },
    data: { name: args.name },
  })

  if (!row) {
    return { ok: false, error: { kind: 'not found', resource: 'specialization' } }
  }

  return { ok: true, value: { id: row.id } }
}

export async function deleteSpecialization(specializationId: UUID): Promise<Res<Id, NotFoundError>> {
  const row = await db.specializations.delete({
    where: { id: specializationId },
  })
  if (!row) {
    return { ok: false, error: { kind: 'not found', resource: 'specialization' } }
  }
  return { ok: true, value: { id: row.id } }
}

// test

export async function initTest(): Promise<Res<null, null>> {
  await db.$transaction(async (tx) => {
    await tx.admins.deleteMany()
    await tx.appointments.deleteMany()
    await tx.customers.deleteMany()
    await tx.secretaries.deleteMany()
    await tx.services.deleteMany()
    await tx.service_names.deleteMany()
    await tx.specialists.deleteMany()
    await tx.specialist_hours.deleteMany()
    await tx.specializations.deleteMany()

    await tx.admins.create({
      data: {
        id: generateId(),
        name: 'Admin Test',
        email: 'admin@test.com',
        password: await hashPassword('123mudar'),
      },
    })
  })
  return { ok: true, value: null }
}
