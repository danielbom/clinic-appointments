export namespace domain {
  /**
   * @format uuid
   * @example 019dcd01-5a4a-736f-9407-8e69aa9433bc
   * @maxLength 36
   */
  export type Uuid = string

  /**
   * Integer value in cents.
   * @format integer
   * @minimum 0
   */
  export type Price = number

  /**
   * Integer value in minutes.
   * @format integer
   * @minimum 0
   * @maximum 600
   */
  export type Duration = number

  /**
   * @format email
   * @example user@domain.com
   * @minLength 1
   * @maxLength 200
   */
  export type Email = string

  /**
   * @maxLength 36
   */
  export type Role = 'admin' | 'secretary'

  /**
   * Access password.
   * @example 59@qhPYphEUYwGDK
   * @minLength 1
   * @maxLength 30
   */
  export type Password = string

  /**
   * Phone digits with punctuations (spaces matter)
   * @format phone
   * @example +55 (94) 4019-9572
   * @maxLength 24
   */
  export type Phone = string

  /**
   * CPF digits with or without punctuations
   * @format cpf
   * @example 900.394.636-13 or 90039463613
   * @minLength 11
   * @maxLength 14
   */
  export type Cpf = string

  /**
   * CNPJ digits with or without punctuations
   * @format cnpj
   * @example 20.573.002/0001-87 or 20573002000187
   * @minLength 14
   * @maxLength 18
   */
  export type Cnpj = string

  /**
   * Non empty string
   * @minLength 1
   * @maxLength 200
   */
  export type Name = string

  /**
   * date only string in format YYYY-MM-DD
   * @format date
   * @example 2026-05-02
   * @minLength 10
   * @maxLength 10
   */
  export type Date = string

  /**
   * time only string in format HH:MM:SS
   * @format time
   * @example 12:21:50
   * @minLength 8
   * @maxLength 8
   */
  export type Time = string

  export type Resource = //
    | 'appointment' //
    | 'customer'
    | 'secretary'
    | 'service'
    | 'service_name'
    | 'specialist'
    | 'specialization'
}

export namespace schemas {
  export interface Id {
    id: domain.Uuid
  }

  export type Count = number

  export interface Status {
    status: boolean
    /**
     * @format datetime
     */
    updatedAt: string
    environment: string
    database?: {
      status: 'connected' | 'disconnected'
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

  /**
   * 0: None 1: Pending 2: Realized 3: Canceled
   */
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
    date: domain.Date
    time: domain.Time
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
    date: domain.Date
    time: domain.Time
    specialistName: domain.Name
    status: schemas.AppointmentStatus
  }

  export interface Customer {
    id: domain.Uuid
    name: domain.Name
    email?: domain.Email
    phone: domain.Phone
    birthdate: domain.Date
    cpf: domain.Cpf
  }

  export interface Secretary {
    id: domain.Uuid
    name: domain.Name
    email: domain.Email
    phone: domain.Phone
    birthdate: domain.Date
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
    birthdate: domain.Date
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
    date: domain.Date
    time: domain.Time
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

export namespace errors {
  /**
   * Represents a standardized error response following RFC 7807. Provides both machine-readable and human-readable information about an error condition.
   */
  export interface ProblemDetails {
    /**
     * A machine-readable, domain-specific error code used by clients to implement conditional logic.
     */
    code: //
      | 'auth_error' //
      | 'forbidden_error'
      | 'validation_error'
      | 'resource_not_found'
      | 'resource_conflict'
      | 'internal_error'
    /**
     * A URI reference that identifies the problem type. This value resolve to documentation describing the error category and possible resolutions.
     * @format uri
     */
    type: string
    /**
     * A short, human-readable summary of the problem type. It remain stable across occurrences of the same error.
     */
    title: string
    /**
     * The HTTP status code returned for this occurrence of the problem.
     */
    status: number
    /**
     * A human-readable explanation specific to this occurrence of the problem, providing additional context when necessary.
     */
    detail?: string
    /**
     * A URI reference that identifies the specific occurrence of the problem, such as a request path or a correlation resource.
     */
    instance?: string
    /**
     * A unique identifier used for tracing the request across distributed systems, useful for diagnostics and support.
     */
    traceId?: string
    /**
     * Indicates the location of the input associated with the error, such as request body, path parameters, or query parameters.
     */
    source?: {
      in: 'body' | 'path' | 'query'
      path: string
    }
    /**
     * A map of validation errors where each key is a field or parameter name and the value is a list of associated validation messages.
     */
    errors?: Record<string, string[]>
  }

  /**
   * Represents an error caused by invalid input or an invalid resource state. Uses code 'validation_error' and HTTP status 400. Includes detailed validation messages in the 'errors' property and may indicate the input location through 'source'.
   */
  export type ValidationProblemDetails = errors.ProblemDetails & {
    code: 'validation_error'
    status: 400
    title: 'Validation error'
  }

  /**
   * Represents an authentication failure. Uses code 'auth_error' and HTTP status 401. Occurs when credentials are missing, invalid, or expired, such as incorrect login information or an invalid authentication token.
   */
  export type AuthProblemDetails = errors.ProblemDetails & {
    code: 'auth_error'
    status: 401
    title: 'Invalid token' | 'Invalid credentials'
  }

  /**
   * Represents an authorization failure. Uses code 'forbidden_error' and HTTP status 403. Occurs when the authenticated user does not have permission to access the requested resource or perform the operation.
   */
  export type InvalidAccessProblemDetails = errors.ProblemDetails & {
    code: 'forbidden_error'
    status: 403
    title: 'Forbidden error'
    detail?: string
  }

  /**
   * Represents a missing resource. Uses code 'resource_not_found' and HTTP status 404. Occurs when the specified resource cannot be found.
   */
  export type NotFoundProblemDetails = errors.ProblemDetails & {
    code: 'resource_not_found'
    status: 404
    title: 'Resource not found'
  }

  /**
   * Represents a resource conflict. Uses code 'resource_conflict' and HTTP status 409. Occurs when attempting to create or modify a resource that would violate a uniqueness constraint.
   */
  export type ConflictProblemDetails = errors.ProblemDetails & {
    code: 'resource_conflict'
    status: 409
    title: 'Resource conflict'
  }

  /**
   * Represents an unexpected server error. Uses code 'internal_error' and HTTP status 500. Indicates that the server encountered an unhandled condition while processing the request.
   */
  export type InternalProblemDetails = errors.ProblemDetails & {
    code: 'internal_error'
    status: 500
    title: 'Internal error'
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
    date: domain.Date
    time: domain.Time
  }

  export interface AppointmentsUpdateBody {
    date: domain.Date
    time: domain.Time
    status: schemas.AppointmentStatus
  }

  export interface CustomerCreateBody {
    name: domain.Name
    email: domain.Email
    phone: domain.Phone
    birthdate: domain.Date
    cpf: domain.Cpf
  }

  export interface CustomerUpdateBody {
    name: domain.Name
    email: domain.Email
    phone: domain.Phone
    birthdate: domain.Date
    cpf: domain.Cpf
  }

  export interface SecretaryCreateBody {
    name: domain.Name
    email: domain.Email
    phone: domain.Phone
    birthdate: domain.Date
    password: domain.Password
    cpf: domain.Cpf
    cnpj: domain.Cnpj
  }

  export interface SecretaryUpdateBody {
    name: domain.Name
    email: domain.Email
    phone: domain.Phone
    birthdate: domain.Date
    password?: domain.Password
    cpf: domain.Cpf
    cnpj: domain.Cnpj
  }

  export interface ServiceAvailableCreateBody {
    name: domain.Name
    specialization?: domain.Name
    specializationId?: domain.Uuid
  }

  export interface ServiceAvailableUpdateBody {
    name: domain.Name
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
    name: domain.Name
    email: domain.Email
    phone: domain.Phone
    birthdate: domain.Date
    cpf: domain.Cpf
    cnpj: domain.Cnpj
    services: body.SpecialistsCreateBodyService[]
  }

  export interface SpecialistUpdateBody {
    name: domain.Name
    email: domain.Email
    phone: domain.Phone
    birthdate: domain.Date
    cpf: domain.Cpf
    cnpj: domain.Cnpj
    services: body.SpecialistsCreateBodyService[]
  }

  export interface SpecializationCreateBody {
    name: domain.Name
  }

  export interface SpecializationUpdateBody {
    name: domain.Name
  }
}

export namespace query {
  export type StartDate = domain.Date

  export type EndDate = domain.Date

  export type ServiceName = domain.Name

  export type Service = domain.Name

  export type Specialist = domain.Name

  export type Specialization = domain.Name

  export type Customer = domain.Name

  export type Status = schemas.AppointmentStatus

  export type Name = domain.Name

  export type Cpf = domain.Cpf

  export type Cnpj = domain.Cnpj

  export type Phone = domain.Phone

  /**
   * @default 0
   * @format integer
   * @minimum 0
   */
  export type Page = number

  /**
   * @default 10
   * @format integer
   * @minimum 1
   */
  export type PageSize = number
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
        400: errors.ValidationProblemDetails
        401: errors.AuthProblemDetails
      }
    }

    export namespace refresh {
      export type responses = {
        200: schemas.AuthResponse
        400: errors.ValidationProblemDetails
        401: errors.AuthProblemDetails
        500: errors.InternalProblemDetails
      }
    }

    export namespace me {
      export type responses = {
        200: schemas.AuthIdentity
        400: errors.ValidationProblemDetails
        401: errors.AuthProblemDetails
      }
    }
  }

  export namespace appointments {
    export namespace listAppointments {
      export type query = {
        page?: query.Page
        pageSize?: query.PageSize
        startDate?: query.StartDate
        endDate?: query.EndDate
        serviceName?: query.ServiceName
        specialist?: query.Specialist
        customer?: query.Customer
        status?: query.Status
      }

      export type responses = {
        200: schemas.Appointment[]
        400: errors.ValidationProblemDetails
      }
    }

    export namespace createAppointment {
      export type body = body.AppointmentsCreateBody

      export type responses = {
        201: schemas.Id
        400: errors.ValidationProblemDetails
        404: errors.NotFoundProblemDetails
      }
    }

    export namespace countAppointments {
      export type query = {
        startDate?: query.StartDate
        endDate?: query.EndDate
        serviceName?: query.ServiceName
        specialist?: query.Specialist
        customer?: query.Customer
        status?: query.Status
      }

      export type responses = {
        200: schemas.Count
        400: errors.ValidationProblemDetails
      }
    }

    export namespace getAppointmentsCalendar {
      export type query = {
        startDate?: query.StartDate
        endDate?: query.EndDate
      }

      export type responses = {
        200: schemas.AppointmentCalendar[]
        400: errors.ValidationProblemDetails
      }
    }

    export namespace getAppointmentsCalendarCount {
      export type query = {
        startDate?: query.StartDate
        endDate?: query.EndDate
      }

      export type responses = {
        200: schemas.AppointmentCalendarCount[]
        400: errors.ValidationProblemDetails
      }
    }

    export namespace getAppointmentById {
      export type responses = {
        200: schemas.Appointment
        400: errors.ValidationProblemDetails
        404: errors.NotFoundProblemDetails
      }
    }

    export namespace updateAppointment {
      export type body = body.AppointmentsUpdateBody

      export type responses = {
        200: schemas.Id
        400: errors.ValidationProblemDetails
      }
    }

    export namespace deleteAppointment {
      export type responses = {
        /**
         * Item deleted successfully
         */
        204: any
        400: errors.ValidationProblemDetails
        404: errors.NotFoundProblemDetails
      }
    }
  }

  export namespace customers {
    export namespace listCustomers {
      export type query = {
        page?: query.Page
        pageSize?: query.PageSize
        name?: query.Name
        cpf?: query.Cpf
        phone?: query.Phone
      }

      export type responses = {
        200: schemas.Customer[]
        400: errors.ValidationProblemDetails
      }
    }

    export namespace createCustomer {
      export type body = body.CustomerCreateBody

      export type responses = {
        201: schemas.Id
        400: errors.ValidationProblemDetails
      }
    }

    export namespace countCustomers {
      export type query = {
        name?: query.Name
        cpf?: query.Cpf
        phone?: query.Phone
      }

      export type responses = {
        200: schemas.Count
        400: errors.ValidationProblemDetails
      }
    }

    export namespace getCustomerById {
      export type responses = {
        200: schemas.Customer
        400: errors.ValidationProblemDetails
        404: errors.ValidationProblemDetails
      }
    }

    export namespace updateCustomer {
      export type body = body.CustomerUpdateBody

      export type responses = {
        200: schemas.Id
        400: errors.ValidationProblemDetails
      }
    }

    export namespace deleteCustomer {
      export type responses = {
        /**
         * Item deleted successfully
         */
        204: any
        400: errors.ValidationProblemDetails
        404: errors.NotFoundProblemDetails
      }
    }
  }

  export namespace secretaries {
    export namespace listSecretaries {
      export type query = {
        page?: query.Page
        pageSize?: query.PageSize
        name?: query.Name
        cpf?: query.Cpf
        cnpj?: query.Cnpj
        phone?: query.Phone
      }

      export type responses = {
        200: schemas.Secretary[]
        400: errors.ValidationProblemDetails
      }
    }

    export namespace createSecretary {
      export type body = body.SecretaryCreateBody

      export type responses = {
        /**
         * Secretary created successfully
         */
        201: schemas.Id
        400: errors.ValidationProblemDetails
        409: errors.ConflictProblemDetails
      }
    }

    export namespace countSecretaries {
      export type query = {
        name?: query.Name
        cpf?: query.Cpf
        cnpj?: query.Cnpj
        phone?: query.Phone
      }

      export type responses = {
        200: schemas.Count
        400: errors.ValidationProblemDetails
      }
    }

    export namespace getSecretaryById {
      export type responses = {
        200: schemas.Customer
        400: errors.ValidationProblemDetails
        404: errors.NotFoundProblemDetails
      }
    }

    export namespace updateSecretary {
      export type body = body.SecretaryUpdateBody

      export type responses = {
        /**
         * Secretary updated successfully
         */
        200: schemas.Id
        400: errors.ValidationProblemDetails
        404: errors.NotFoundProblemDetails
        409: errors.ConflictProblemDetails
      }
    }

    export namespace deleteSecretary {
      export type responses = {
        /**
         * Secretary deleted successfully
         */
        204: any
        400: errors.ValidationProblemDetails
        404: errors.NotFoundProblemDetails
      }
    }
  }

  export namespace servicesAvailable {
    export namespace listServicesAvailable {
      export type query = {
        page?: query.Page
        pageSize?: query.PageSize
      }

      export type responses = {
        200: schemas.ServiceGroup[]
        400: errors.ValidationProblemDetails
      }
    }

    export namespace createServiceAvailable {
      export type body = body.ServiceAvailableCreateBody

      export type responses = {
        /**
         * Service Available created successfully
         */
        201: schemas.Id
        400: errors.ValidationProblemDetails
        409: errors.ConflictProblemDetails
      }
    }

    export namespace getServiceAvailableById {
      export type responses = {
        200: schemas.ServiceAvailable
        400: errors.ValidationProblemDetails
        404: errors.NotFoundProblemDetails
      }
    }

    export namespace updateServiceAvailable {
      export type body = body.ServiceAvailableUpdateBody

      export type responses = {
        /**
         * Service Available updated successfully
         */
        200: schemas.Id
        400: errors.ValidationProblemDetails
        404: errors.NotFoundProblemDetails
      }
    }

    export namespace deleteServiceAvailable {
      export type responses = {
        /**
         * Service Available deleted successfully
         */
        204: any
        400: errors.ValidationProblemDetails
        404: errors.NotFoundProblemDetails
      }
    }
  }

  export namespace services {
    export namespace listServices {
      export type query = {
        page?: query.Page
        pageSize?: query.PageSize
        service?: query.Service
        specialist?: query.Specialist
        specialization?: query.Specialization
      }

      export type responses = {
        200: schemas.ServiceEnriched[]
        400: errors.ValidationProblemDetails
      }
    }

    export namespace createService {
      export type body = body.ServiceCreateBody

      export type responses = {
        /**
         * Service created successfully
         */
        201: schemas.Id
        400: errors.ValidationProblemDetails
      }
    }

    export namespace countServices {
      export type query = {
        service?: query.Service
        specialist?: query.Specialist
        specialization?: query.Specialization
      }

      export type responses = {
        200: schemas.Count
        400: errors.ValidationProblemDetails
      }
    }

    export namespace getServiceById {
      export type responses = {
        200: schemas.Service
        400: errors.ValidationProblemDetails
        404: errors.NotFoundProblemDetails
      }
    }

    export namespace updateService {
      export type body = body.ServiceUpdateBody

      export type responses = {
        /**
         * Service updated successfully
         */
        200: schemas.Id
        400: errors.ValidationProblemDetails
        404: errors.NotFoundProblemDetails
      }
    }

    export namespace deleteService {
      export type responses = {
        /**
         * Service deleted successfully
         */
        204: any
        400: errors.ValidationProblemDetails
        404: errors.NotFoundProblemDetails
      }
    }
  }

  export namespace serviceGroups {
    export namespace listServiceGroups {
      export type responses = {
        200: schemas.ServiceGroup[]
        400: errors.ValidationProblemDetails
      }
    }
  }

  export namespace specialists {
    export namespace listSpecialists {
      export type query = {
        page?: query.Page
        pageSize?: query.PageSize
        name?: query.Name
        cpf?: query.Cpf
        cnpj?: query.Cnpj
        phone?: query.Phone
      }

      export type responses = {
        200: schemas.Specialist[]
        400: errors.ValidationProblemDetails
      }
    }

    export namespace createSpecialist {
      export type body = body.SpecialistCreateBody

      export type responses = {
        /**
         * Specialist created successfully
         */
        201: schemas.Id
        400: errors.ValidationProblemDetails
        409: errors.ConflictProblemDetails
      }
    }

    export namespace countSpecialists {
      export type query = {
        name?: query.Name
        cpf?: query.Cpf
        cnpj?: query.Cnpj
        phone?: query.Phone
      }

      export type responses = {
        200: schemas.Count
        400: errors.ValidationProblemDetails
      }
    }

    export namespace getSpecialistServices {
      export type responses = {
        200: schemas.SpecialistService[]
        400: errors.ValidationProblemDetails
        404: errors.NotFoundProblemDetails
      }
    }

    export namespace getSpecialistSpecializations {
      export type responses = {
        200: schemas.Specialization[]
        400: errors.ValidationProblemDetails
        404: errors.NotFoundProblemDetails
      }
    }

    export namespace getSpecialistAppointments {
      export type query = {
        page?: query.Page
        pageSize?: query.PageSize
      }

      export type responses = {
        200: schemas.SpecialistAppointment[]
        400: errors.ValidationProblemDetails
        404: errors.NotFoundProblemDetails
      }
    }

    export namespace getSpecialistService {
      export type responses = {
        200: schemas.Service
        400: errors.ValidationProblemDetails
        404: errors.NotFoundProblemDetails
      }
    }

    export namespace getSpecialistById {
      export type responses = {
        200: schemas.Specialist
        400: errors.ValidationProblemDetails
        404: errors.NotFoundProblemDetails
      }
    }

    export namespace updateSpecialist {
      export type body = body.SpecialistUpdateBody

      export type responses = {
        /**
         * Specialist updated successfully
         */
        200: schemas.Id
        400: errors.ValidationProblemDetails
        404: errors.NotFoundProblemDetails
      }
    }

    export namespace deleteSpecialist {
      export type responses = {
        /**
         * Specialist deleted successfully
         */
        204: any
        400: errors.ValidationProblemDetails
        404: errors.NotFoundProblemDetails
      }
    }
  }

  export namespace specializations {
    export namespace listSpecializations {
      export type responses = {
        200: schemas.Specialization[]
        400: errors.ValidationProblemDetails
      }
    }

    export namespace createSpecialization {
      export type body = body.SpecializationCreateBody

      export type responses = {
        /**
         * Specialization created successfully
         */
        201: schemas.Id
        400: errors.ValidationProblemDetails
        409: errors.ConflictProblemDetails
      }
    }

    export namespace updateSpecialization {
      export type body = body.SpecializationUpdateBody

      export type responses = {
        /**
         * Specialization updated successfully
         */
        200: schemas.Id
        400: errors.ValidationProblemDetails
        404: errors.NotFoundProblemDetails
      }
    }

    export namespace deleteSpecialization {
      export type responses = {
        /**
         * Specialization deleted successfully
         */
        204: any
        400: errors.ValidationProblemDetails
        404: errors.NotFoundProblemDetails
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
