import { ajv } from './ajv'
import * as types from './swagger-types'

export const validations = {
  auth: {
    login: {
      body: ajv.compile<types.api.auth.login.body>({
        $ref: 'https://dev-clinic-appointments.com.br/schemas/body/AuthLogin.json',
      }),
    },
  },
  appointments: {
    createAppointment: {
      body: ajv.compile<types.api.appointments.createAppointment.body>({
        $ref: 'https://dev-clinic-appointments.com.br/schemas/body/AppointmentsCreateBody.json',
      }),
    },
    updateAppointment: {
      body: ajv.compile<types.api.appointments.updateAppointment.body>({
        $ref: 'https://dev-clinic-appointments.com.br/schemas/body/AppointmentsUpdateBody.json',
      }),
    },
  },
  customers: {
    createCustomer: {
      body: ajv.compile<types.api.customers.createCustomer.body>({
        $ref: 'https://dev-clinic-appointments.com.br/schemas/body/CustomerCreateBody.json',
      }),
    },
    updateCustomer: {
      body: ajv.compile<types.api.customers.updateCustomer.body>({
        $ref: 'https://dev-clinic-appointments.com.br/schemas/body/CustomerUpdateBody.json',
      }),
    },
  },
  secretaries: {
    createSecretary: {
      body: ajv.compile<types.api.secretaries.createSecretary.body>({
        $ref: 'https://dev-clinic-appointments.com.br/schemas/body/SecretaryCreateBody.json',
      }),
    },
    updateSecretary: {
      body: ajv.compile<types.api.secretaries.updateSecretary.body>({
        $ref: 'https://dev-clinic-appointments.com.br/schemas/body/SecretaryUpdateBody.json',
      }),
    },
  },
  servicesAvailable: {
    createServiceAvailable: {
      body: ajv.compile<types.api.servicesAvailable.createServiceAvailable.body>({
        $ref: 'https://dev-clinic-appointments.com.br/schemas/body/ServiceAvailableCreateBody.json',
      }),
    },
    updateServiceAvailable: {
      body: ajv.compile<types.api.servicesAvailable.updateServiceAvailable.body>({
        $ref: 'https://dev-clinic-appointments.com.br/schemas/body/ServiceAvailableUpdateBody.json',
      }),
    },
  },
  services: {
    createService: {
      body: ajv.compile<types.api.services.createService.body>({
        $ref: 'https://dev-clinic-appointments.com.br/schemas/body/ServiceCreateBody.json',
      }),
    },
    updateService: {
      body: ajv.compile<types.api.services.updateService.body>({
        $ref: 'https://dev-clinic-appointments.com.br/schemas/body/ServiceUpdateBody.json',
      }),
    },
  },
  specialists: {
    createSpecialist: {
      body: ajv.compile<types.api.specialists.createSpecialist.body>({
        $ref: 'https://dev-clinic-appointments.com.br/schemas/body/SpecialistCreateBody.json',
      }),
    },
    updateSpecialist: {
      body: ajv.compile<types.api.specialists.updateSpecialist.body>({
        $ref: 'https://dev-clinic-appointments.com.br/schemas/body/SpecialistUpdateBody.json',
      }),
    },
  },
  specializations: {
    createSpecialization: {
      body: ajv.compile<types.api.specializations.createSpecialization.body>({
        $ref: 'https://dev-clinic-appointments.com.br/schemas/body/SpecializationCreateBody.json',
      }),
    },
    updateSpecialization: {
      body: ajv.compile<types.api.specializations.updateSpecialization.body>({
        $ref: 'https://dev-clinic-appointments.com.br/schemas/body/SpecializationUpdateBody.json',
      }),
    },
  },
}
