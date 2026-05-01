import * as types from './swagger-types'
import { type db } from './db'

export function getDatePart(isodate: string): string {
  return isodate.slice(0, 10)
}

export function getTimePart(isodate: string): string {
  return isodate.slice(11, 19)
}

export const presenter = {
  appointment(
    row: Awaited<
      ReturnType<
        typeof db.appointments.findMany<{
          include: {
            customers: {}
            service_names: {}
            specialists: {}
          }
        }>
      >
    >[number],
  ): types.schemas.Appointment {
    return {
      id: row.id,
      customerName: row.customers.name,
      customerId: row.customer_id,
      serviceName: row.service_names.name,
      serviceNameId: row.service_names.id,
      specialistName: row.specialists.name,
      specialistId: row.specialists.id,
      price: row.price,
      duration: row.duration,
      date: getDatePart(row.date.toISOString()),
      time: getTimePart(row.time.toISOString()),
      status: row.status,
    }
  },
  specialistAppointment(
    row: Awaited<
      ReturnType<
        typeof db.appointments.findMany<{
          include: {
            customers: {}
            service_names: {}
          }
        }>
      >
    >[number],
  ): types.schemas.SpecialistAppointment {
    return {
      id: row.id,
      customerName: row.customers.name,
      customerId: row.customer_id,
      serviceName: row.service_names.name,
      serviceNameId: row.service_names.id,
      price: row.price,
      duration: row.duration,
      date: getDatePart(row.date.toISOString()),
      time: getTimePart(row.time.toISOString()),
      status: row.status,
    }
  },
  secretary(row: Awaited<ReturnType<typeof db.secretaries.findMany<{}>>>[number]): types.schemas.Secretary {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      birthdate: getDatePart(row.birthdate.toISOString()),
      cpf: row.cpf,
      cnpj: row.cnpj ?? undefined,
    }
  },
  customer(row: Awaited<ReturnType<typeof db.customers.findMany<{}>>>[number]): types.schemas.Customer {
    return {
      id: row.id,
      name: row.name,
      email: row.email ?? undefined,
      phone: row.phone,
      birthdate: getDatePart(row.birthdate.toISOString()),
      cpf: row.cpf,
    }
  },
  specialist(row: Awaited<ReturnType<typeof db.specialists.findMany<{}>>>[number]): types.schemas.Specialist {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      birthdate: getDatePart(row.birthdate.toISOString()),
      cpf: row.cpf,
      cnpj: row.cnpj ?? undefined,
    }
  },
  specialistService(
    row: Awaited<
      ReturnType<
        typeof db.services.findMany<{
          include: {
            service_names: {}
          }
        }>
      >
    >[number],
  ) {
    return {
      id: row.id,
      specializationId: row.service_names.specialization_id,
      serviceName: row.service_names.name,
      serviceNameId: row.service_name_id,
      price: row.price,
      duration: row.duration,
    }
  },
  service(
    row: Awaited<
      ReturnType<
        typeof db.services.findMany<{
          include: {
            service_names: { include: { specializations: {} } }
            specialists: {}
          }
        }>
      >
    >[number],
  ): types.schemas.ServiceEnriched {
    return {
      id: row.id,
      serviceName: row.service_names.name,
      serviceNameId: row.service_name_id,
      specialistName: row.specialists.name,
      specialistId: row.specialists.id,
      specialization: row.service_names.specializations.name,
      specializationId: row.service_names.specializations.id,
      price: row.price,
      duration: row.duration,
    }
  },
  serviceGroup(
    row: Awaited<ReturnType<typeof db.specializations.findMany<{ include: { service_names: {} } }>>>[number],
  ): types.schemas.ServiceGroup {
    return {
      id: row.id,
      name: row.name,
      items: row.service_names.map((s) => ({
        id: s.id,
        name: s.name,
      })),
    }
  },
}
