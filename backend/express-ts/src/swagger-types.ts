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

  export type Role = string

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

  export type Resource = string
}

export namespace errors {
  export interface BadRequest {
    error: {
      code: 'auth_error' | 'validation_error' | 'unknown error'
      location: 'auth' | 'query' | 'path' | 'body' | 'execution'
      message: string
      key?: string
      stack?: string
    }
  }

  export interface NotFound {
    error: {
      code: 'resource_not_found'
      resource?: domain.Resource
      message: string
      key?: string
      stack?: string
    }
  }

  export interface AlreadyExists {
    error: {
      code: 'resource_already_exists'
      resource?: domain.Resource
      message: string
      key?: string
      stack?: string
    }
  }

  export interface InternalError {
    error: {
      code: 'internal_error'
      location: 'auth' | 'query' | 'path' | 'body' | 'execution'
      message: string
      stack?: string
    }
  }
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

  export interface AuthResponse {
    accessToken: string
    refreshToken: string
  }

  export interface AuthIdentity {
    id: domain.Uuid
    name: domain.Name
    email: domain.Email
    role: domain.Role
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

  export interface ServiceAvailable {
    serviceNameId?: domain.Uuid
    serviceName?: domain.Name
    specializationId?: domain.Uuid
    specialization?: domain.Name
  }

  export interface ServiceEnriched {
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

  export interface Service {
    id: domain.Uuid
    serviceNameId: domain.Uuid
    specialistId: domain.Uuid
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

  export interface SpecialistService {
    id: domain.Uuid
    specializationId: domain.Uuid
    serviceName: domain.Name
    serviceNameId: domain.Uuid
    price: domain.Price
    duration: domain.Duration
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

export namespace api {
  export namespace health {
    export namespace healthCheck {
      export type responses = {
        /**
         * API is healthy
         */
        200: schemas.Status
      }
    }
  }

  export namespace auth {
    export namespace login {
      export type body = body.AuthLogin

      export type responses = {
        200: schemas.AuthResponse
        400: errors.BadRequest
      }
    }

    export namespace refresh {
      export type responses = {
        200: schemas.AuthResponse
        400: errors.BadRequest
        500: errors.InternalError
      }
    }

    export namespace me {
      export type responses = {
        200: schemas.AuthIdentity
        400: errors.BadRequest
      }
    }
  }

  export namespace appointments {
    export namespace listAppointments {
      export type responses = {
        200: schemas.Appointment[]
        400: errors.BadRequest
      }
    }

    export namespace createAppointment {
      export type body = body.AppointmentsCreateBody

      export type responses = {
        200: schemas.Id
        400: errors.BadRequest
        404: errors.NotFound
      }
    }

    export namespace countAppointments {
      export type responses = {
        200: schemas.Count
        400: errors.BadRequest
      }
    }

    export namespace getAppointmentsCalendar {
      export type responses = {
        200: schemas.AppointmentCalendar[]
        400: errors.BadRequest
      }
    }

    export namespace getAppointmentsCalendarCount {
      export type responses = {
        200: schemas.AppointmentCalendarCount[]
        400: errors.BadRequest
      }
    }

    export namespace getAppointmentById {
      export type responses = {
        200: schemas.Appointment
        400: errors.BadRequest
        404: errors.NotFound
      }
    }

    export namespace updateAppointment {
      export type body = body.AppointmentsUpdateBody

      export type responses = {
        200: schemas.Id
        400: errors.BadRequest
      }
    }

    export namespace deleteAppointment {
      export type responses = {
        /**
         * Item deleted successfully
         */
        204: any
        400: errors.BadRequest
        404: errors.NotFound
      }
    }
  }

  export namespace customers {
    export namespace listCustomers {
      export type responses = {
        200: schemas.Customer[]
        400: errors.BadRequest
      }
    }

    export namespace createCustomer {
      export type body = body.CustomerCreateBody

      export type responses = {
        200: schemas.Id
        400: errors.BadRequest
      }
    }

    export namespace countCustomers {
      export type responses = {
        200: schemas.Count
        400: errors.BadRequest
      }
    }

    export namespace getCustomerById {
      export type responses = {
        200: schemas.Customer
        400: errors.BadRequest
        404: errors.NotFound
      }
    }

    export namespace updateCustomer {
      export type body = body.CustomerUpdateBody

      export type responses = {
        200: schemas.Id
        400: errors.BadRequest
      }
    }

    export namespace deleteCustomer {
      export type responses = {
        /**
         * Item deleted successfully
         */
        204: any
        400: errors.BadRequest
        404: errors.NotFound
      }
    }
  }

  export namespace secretaries {
    export namespace listSecretaries {
      export type responses = {
        200: schemas.Secretary[]
        400: errors.BadRequest
      }
    }

    export namespace createSecretary {
      export type body = body.SecretaryCreateBody

      export type responses = {
        200: schemas.Id
        400: errors.BadRequest
        422: errors.AlreadyExists
      }
    }

    export namespace countSecretaries {
      export type responses = {
        200: schemas.Count
        400: errors.BadRequest
      }
    }

    export namespace getSecretaryById {
      export type responses = {
        200: schemas.Customer
        400: errors.BadRequest
        404: errors.NotFound
      }
    }

    export namespace updateSecretary {
      export type body = body.SecretaryUpdateBody

      export type responses = {
        200: schemas.Id
        400: errors.BadRequest
        404: errors.NotFound
        422: errors.AlreadyExists
      }
    }

    export namespace deleteSecretary {
      export type responses = {
        /**
         * Item deleted successfully
         */
        204: any
        400: errors.BadRequest
        404: errors.NotFound
      }
    }
  }

  export namespace servicesAvailable {
    export namespace listServicesAvailable {
      export type responses = {
        200: schemas.ServiceGroup[]
        400: errors.BadRequest
      }
    }

    export namespace createServiceAvailable {
      export type body = body.ServiceAvailableCreateBody

      export type responses = {
        200: schemas.Id
        400: errors.BadRequest
        422: errors.AlreadyExists
      }
    }

    export namespace getServiceAvailableById {
      export type responses = {
        200: schemas.ServiceAvailable
        400: errors.BadRequest
        404: errors.NotFound
      }
    }

    export namespace updateServiceAvailable {
      export type body = body.ServiceAvailableUpdateBody

      export type responses = {
        200: schemas.Id
        400: errors.BadRequest
        404: errors.NotFound
      }
    }

    export namespace deleteServiceAvailable {
      export type responses = {
        /**
         * Item deleted successfully
         */
        204: any
        400: errors.BadRequest
        404: errors.NotFound
      }
    }
  }

  export namespace services {
    export namespace listServices {
      export type responses = {
        200: schemas.ServiceEnriched[]
        400: errors.BadRequest
      }
    }

    export namespace createService {
      export type body = body.ServiceCreateBody

      export type responses = {
        200: schemas.Id
        400: errors.BadRequest
      }
    }

    export namespace countServices {
      export type responses = {
        200: schemas.Count
        400: errors.BadRequest
      }
    }

    export namespace getServiceById {
      export type responses = {
        200: schemas.Service
        400: errors.BadRequest
        404: errors.NotFound
      }
    }

    export namespace updateService {
      export type body = body.ServiceUpdateBody

      export type responses = {
        200: schemas.Id
        400: errors.BadRequest
        404: errors.NotFound
      }
    }

    export namespace deleteService {
      export type responses = {
        /**
         * Item deleted successfully
         */
        204: any
        400: errors.BadRequest
        404: errors.NotFound
      }
    }
  }

  export namespace serviceGroups {
    export namespace listServiceGroups {
      export type responses = {
        200: schemas.ServiceGroup[]
        400: errors.BadRequest
      }
    }
  }

  export namespace specialists {
    export namespace listSpecialists {
      export type responses = {
        200: schemas.Specialist[]
        400: errors.BadRequest
      }
    }

    export namespace createSpecialist {
      export type body = body.SpecialistCreateBody

      export type responses = {
        200: schemas.Id
        400: errors.BadRequest
        422: errors.AlreadyExists
      }
    }

    export namespace countSpecialists {
      export type responses = {
        200: schemas.Count
        400: errors.BadRequest
      }
    }

    export namespace getSpecialistServices {
      export type responses = {
        200: schemas.SpecialistService[]
        400: errors.BadRequest
        404: errors.NotFound
      }
    }

    export namespace getSpecialistSpecializations {
      export type responses = {
        200: schemas.Specialization[]
        400: errors.BadRequest
        404: errors.NotFound
      }
    }

    export namespace getSpecialistAppointments {
      export type responses = {
        200: schemas.SpecialistAppointment[]
        400: errors.BadRequest
        404: errors.NotFound
      }
    }

    export namespace getSpecialistService {
      export type responses = {
        200: schemas.Service
        400: errors.BadRequest
        404: errors.NotFound
      }
    }

    export namespace getSpecialistById {
      export type responses = {
        200: schemas.Specialist
        400: errors.BadRequest
        404: errors.NotFound
      }
    }

    export namespace updateSpecialist {
      export type body = body.SpecialistUpdateBody

      export type responses = {
        200: schemas.Id
        400: errors.BadRequest
        404: errors.NotFound
      }
    }

    export namespace deleteSpecialist {
      export type responses = {
        /**
         * Item deleted successfully
         */
        204: any
        400: errors.BadRequest
        404: errors.NotFound
      }
    }
  }

  export namespace specializations {
    export namespace listSpecializations {
      export type responses = {
        200: schemas.Specialization[]
        400: errors.BadRequest
      }
    }

    export namespace createSpecialization {
      export type body = body.SpecializationCreateBody

      export type responses = {
        200: schemas.Id
        400: errors.BadRequest
        422: errors.AlreadyExists
      }
    }

    export namespace updateSpecialization {
      export type body = body.SpecializationUpdateBody

      export type responses = {
        200: schemas.Id
        400: errors.BadRequest
        404: errors.NotFound
      }
    }

    export namespace deleteSpecialization {
      export type responses = {
        /**
         * Item deleted successfully
         */
        204: any
        400: errors.BadRequest
        404: errors.NotFound
      }
    }
  }

  export namespace test {
    export namespace initTest {
      export type responses = {
        200: any
      }
    }

    export namespace statsTest {
      export type responses = {
        200: any
      }
    }

    export namespace debugClaimsTest {
      export type responses = {
        200: any
      }
    }
  }
}

