import { ajv } from './ajv'
import * as types from './swagger-types'

export const validations = {
  auth: {
    login: {
      body: ajv.compile<types.body.AuthLogin>({
        $ref: 'https://dev-clinic-appointments.com.br/schemas/body/AuthLogin.json',
      }),
    },
  },
  appointments: {
    createAppointment: {
      body: ajv.compile<types.body.AppointmentsCreateBody>({
        $ref: 'https://dev-clinic-appointments.com.br/schemas/body/AppointmentsCreateBody.json',
      }),
    },
    updateAppointment: {
      body: ajv.compile<types.body.AppointmentsUpdateBody>({
        $ref: 'https://dev-clinic-appointments.com.br/schemas/body/AppointmentsUpdateBody.json',
      }),
    },
  },
  customers: {
    createCustomer: {
      body: ajv.compile<types.body.CustomerCreateBody>({
        $ref: 'https://dev-clinic-appointments.com.br/schemas/body/CustomerCreateBody.json',
      }),
    },
    updateCustomer: {
      body: ajv.compile<types.body.CustomerUpdateBody>({
        $ref: 'https://dev-clinic-appointments.com.br/schemas/body/CustomerUpdateBody.json',
      }),
    },
  },
  secretaries: {
    createSecretary: {
      body: ajv.compile<types.body.SecretaryCreateBody>({
        $ref: 'https://dev-clinic-appointments.com.br/schemas/body/SecretaryCreateBody.json',
      }),
    },
    updateSecretary: {
      body: ajv.compile<types.body.SecretaryUpdateBody>({
        $ref: 'https://dev-clinic-appointments.com.br/schemas/body/SecretaryUpdateBody.json',
      }),
    },
  },
  servicesAvailable: {
    createServiceAvailable: {
      body: ajv.compile<types.body.ServiceAvailableCreateBody>({
        $ref: 'https://dev-clinic-appointments.com.br/schemas/body/ServiceAvailableCreateBody.json',
      }),
    },
    updateServiceAvailable: {
      body: ajv.compile<types.body.ServiceAvailableUpdateBody>({
        $ref: 'https://dev-clinic-appointments.com.br/schemas/body/ServiceAvailableUpdateBody.json',
      }),
    },
  },
  services: {
    createService: {
      body: ajv.compile<types.body.ServiceCreateBody>({
        $ref: 'https://dev-clinic-appointments.com.br/schemas/body/ServiceCreateBody.json',
      }),
    },
    updateService: {
      body: ajv.compile<types.body.ServiceUpdateBody>({
        $ref: 'https://dev-clinic-appointments.com.br/schemas/body/ServiceUpdateBody.json',
      }),
    },
  },
  specialists: {
    createSpecialist: {
      body: ajv.compile<types.body.SpecialistCreateBody>({
        $ref: 'https://dev-clinic-appointments.com.br/schemas/body/SpecialistCreateBody.json',
      }),
    },
    updateSpecialist: {
      body: ajv.compile<types.body.SpecialistUpdateBody>({
        $ref: 'https://dev-clinic-appointments.com.br/schemas/body/SpecialistUpdateBody.json',
      }),
    },
  },
  specializations: {
    createSpecialization: {
      body: ajv.compile<types.body.SpecializationCreateBody>({
        $ref: 'https://dev-clinic-appointments.com.br/schemas/body/SpecializationCreateBody.json',
      }),
    },
    updateSpecialization: {
      body: ajv.compile<types.body.SpecializationUpdateBody>({
        $ref: 'https://dev-clinic-appointments.com.br/schemas/body/SpecializationUpdateBody.json',
      }),
    },
  },
}
