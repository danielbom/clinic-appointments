export namespace domain {
  /**
   * @format: uuid
   */
  export type Uuid = string

  /**
   * @description: in cents
   * @format: integer
   */
  export type Price = number

  /**
   * @description: in minutes
   * @format: integer
   */
  export type Duration = number

  /**
   * @format: email
   */
  export type Email = string

  export type Password = string

  /**
   * @format: phone
   */
  export type Phone = string

  /**
   * @format: cpf
   */
  export type Cpf = string

  /**
   * @format: cnpj
   */
  export type Cnpj = string

  /**
   * @description: Non empty string
   */
  export type Name = string
}

export namespace schemas {
  export interface Id {
    id: domain.Uuid
  }

  export type Count = number

  export interface Status {
    status: boolean
    updatedAt: string
    environment: string
    database?: {
      status: string
      version: string
      maxConnections: number
      openedConnections: number
      schemaVersion: number
    }
  }

  export type AppointmentStatus = number

  export interface Appointment {
    id: domain.Uuid
    customerName: domain.Name
    customerId: domain.Uuid
    serviceName: domain.Name
    serviceNameId: domain.Uuid
    specialistName: domain.Name
    specialistId: domain.Uuid
    price: domain.Price
    duration: domain.Duration
    date: string
    time: string
    status: schemas.AppointmentStatus
  }

  export type AppointmentCalendarCount = {
    month: number
    pendingCount: number
    realizedCount: number
    canceledCount: number
  }

  export interface AppointmentCalendar {
    id: domain.Uuid
    date: string
    time: string
    specialistName: domain.Name
    status: schemas.AppointmentStatus
  }

  export interface Customer {
    id: domain.Uuid
    name: domain.Name
    email?: domain.Email
    phone: domain.Phone
    birthdate: string
    cpf: domain.Cpf
  }

  export interface Secretary {
    id: domain.Uuid
    name: domain.Name
    email: domain.Email
    phone: domain.Phone
    birthdate: string
    cpf: domain.Cpf
    cnpj?: domain.Cnpj
  }

  export type ServiceAvailable = any

  export interface Service {
    id: domain.Uuid
    serviceName: domain.Name
    serviceNameId: domain.Uuid
    specialistName: domain.Name
    specialistId: domain.Uuid
    specialization: domain.Name
    specializationId: domain.Uuid
    price: domain.Price
    duration: domain.Duration
  }

  export interface ServiceGroup {
    id: domain.Uuid
    name: domain.Name
    items: Array<{
        id: domain.Uuid
        name: domain.Name
      }>
  }

  export interface Specialist {
    id: domain.Uuid
    name: domain.Name
    email: domain.Email
    phone: domain.Phone
    birthdate: string
    cpf: domain.Cpf
    cnpj?: domain.Cnpj
  }

  export interface SpecialistAppointment {
    id: domain.Uuid
    customerName: domain.Name
    customerId: domain.Uuid
    serviceName: domain.Name
    serviceNameId: domain.Uuid
    price: domain.Price
    duration: domain.Duration
    date: string
    time: string
    status: schemas.AppointmentStatus
  }

  export interface Specialization {
    id: domain.Uuid
    name: domain.Name
  }
}
export namespace body {
  export interface AuthLogin {
    email: domain.Email
    password: domain.Password
  }

  export interface AppointmentsCreateBody {
    customerId: domain.Uuid
    serviceId: domain.Uuid
    date: string
    time: string
  }

  export interface AppointmentsUpdateBody {
    date: string
    time: string
    status: schemas.AppointmentStatus
  }

  export interface CustomerCreateBody {
    name: string
    email: domain.Email
    phone: domain.Phone
    birthdate: string
    cpf: domain.Cpf
  }

  export interface CustomerUpdateBody {
    name: string
    email: domain.Email
    phone: domain.Phone
    birthdate: string
    cpf: domain.Cpf
  }

  export interface SecretaryCreateBody {
    name: string
    email: domain.Email
    phone: domain.Phone
    birthdate: string
    password: string
    cpf: domain.Cpf
    cnpj: domain.Cnpj
  }

  export interface SecretaryUpdateBody {
    name: string
    email: domain.Email
    phone: domain.Phone
    birthdate: string
    password?: string
    cpf: domain.Cpf
    cnpj: domain.Cnpj
  }

  export interface ServiceAvailableCreateBody {
    name: string
    specialization?: string
    specializationId?: domain.Uuid
  }

  export interface ServiceAvailableUpdateBody {
    name: string
  }

  export interface ServiceCreateBody {
    specialistId: domain.Uuid
    serviceNameId: domain.Uuid
    price: domain.Price
    duration: domain.Duration
  }

  export interface ServiceUpdateBody {
    price: domain.Price
    duration: domain.Duration
  }

  export interface SpecialistsCreateBodyService {
    serviceNameId: domain.Uuid
    price: domain.Price
    duration: domain.Duration
  }

  export interface SpecialistCreateBody {
    name: string
    email: domain.Email
    phone: domain.Phone
    birthdate: string
    cpf: domain.Cpf
    cnpj: domain.Cnpj
    services: body.SpecialistsCreateBodyService[]
  }

  export interface SpecialistUpdateBody {
    name: string
    email: domain.Email
    phone: domain.Phone
    birthdate: string
    cpf: domain.Cpf
    cnpj: domain.Cnpj
    services: body.SpecialistsCreateBodyService[]
  }

  export interface SpecializationCreateBody {
    name?: string
  }

  export interface SpecializationUpdateBody {
    name?: string
  }
}

