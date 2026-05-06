import * as types from './swagger-types'
import type * as models from './prisma/models.ts'
import { Calendar, CalendarCount, Identity } from './queries'

export function getDatePart(isodate: string): string {
  return isodate.slice(0, 10)
}

export function getTimePart(isodate: string): string {
  return isodate.slice(11, 19)
}

export const AppointmentStatus = {
  None: 0,
  Pending: 1,
  Realized: 2,
  Canceled: 3,
}

export const presenter = {
  appointment(
    row: models.appointmentsModel & {
      customers: models.customersModel
      service_names: models.service_namesModel
      specialists: models.specialistsModel
    },
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
  calendar(row: Calendar): types.schemas.AppointmentCalendar {
    return {
      id: row.id,
      date: getDatePart(row.date.toISOString()),
      time: getTimePart(row.time.toISOString()),
      specialistName: row.specialist_name,
      status: row.status,
    }
  },
  calendarCount(calendarCount: CalendarCount[]): types.schemas.AppointmentCalendarCount[] {
    const response: types.schemas.AppointmentCalendarCount[] = Array.from({ length: 12 }, (_, month) => ({
      month,
      pendingCount: 0,
      realizedCount: 0,
      canceledCount: 0,
    }))

    calendarCount.forEach((count) => {
      switch (count.status) {
        case AppointmentStatus.Pending: {
          response[count.month - 1].pendingCount += count.count
          break
        }
        case AppointmentStatus.Realized: {
          response[count.month - 1].realizedCount += count.count
          break
        }
        case AppointmentStatus.Canceled: {
          response[count.month - 1].canceledCount += count.count
          break
        }
      }
    })

    return response
  },
  identity(identity: Identity): types.schemas.AuthIdentity {
    return {
      id: identity.id,
      name: identity.name,
      email: identity.email,
      role: identity.role,
    }
  },
  specialistAppointment(
    row: models.appointmentsModel & {
      customers: models.customersModel
      service_names: models.service_namesModel
    },
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
  secretary(row: models.secretariesModel): types.schemas.Secretary {
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
  customer(row: models.customersModel): types.schemas.Customer {
    return {
      id: row.id,
      name: row.name,
      email: row.email ?? undefined,
      phone: row.phone,
      birthdate: getDatePart(row.birthdate.toISOString()),
      cpf: row.cpf,
    }
  },
  specialist(row: models.specialistsModel): types.schemas.Specialist {
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
    row: models.servicesModel & {
      service_names: models.service_namesModel
    },
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
  service(row: models.servicesModel): types.schemas.Service {
    return {
      id: row.id,
      specialistId: row.specialist_id,
      serviceNameId: row.service_name_id,
      price: row.price,
      duration: row.duration,
    }
  },
  serviceEnhanced(
    row: models.servicesModel & {
      service_names: models.service_namesModel & {
        specializations: models.specializationsModel
      }
      specialists: models.specialistsModel
    },
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
    row: models.specializationsModel & {
      service_names: models.service_namesModel[]
    },
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
  serviceAvailable(
    row: models.service_namesModel & {
      specializations: models.specializationsModel
    },
  ): types.schemas.ServiceAvailable {
    return {
      serviceName: row.name,
      serviceNameId: row.id,
      specialization: row.specializations.name,
      specializationId: row.specializations.id,
    }
  },
}
