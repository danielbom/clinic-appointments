import { type AxiosResponse } from 'axios'
import { type Config } from '../Config'
import { type Service } from './ServicesEndpoint'
import { type Id } from './types'

export class SpecialistsEndpoint {
  constructor(public _config: Config) {}

  getById(id: string): Promise<AxiosResponse<Specialist>> {
    return this._config.instance.get(`/api/specialists/${id}`)
  }

  getAll(query: SpecialistsGetAllQuery = {}): Promise<AxiosResponse<Specialist[]>> {
    return this._config.instance.get(`/api/specialists`, { params: query })
  }

  count(query: SpecialistsCountAllQuery = {}): Promise<AxiosResponse<number>> {
    return this._config.instance.get(`/api/specialists/count`, { params: query })
  }

  getAppointments(
    id: string,
    query: GetSpecialistAppointmentQuery = {},
  ): Promise<AxiosResponse<SpecialistAppointment[]>> {
    return this._config.instance.get(`/api/specialists/${id}/appointments`, { params: query })
  }

  getSpecializations(id: string): Promise<AxiosResponse<Specialization[]>> {
    return this._config.instance.get(`/api/specialists/${id}/specializations`)
  }

  getServices(id: string): Promise<AxiosResponse<SpecialistService[]>> {
    return this._config.instance.get(`/api/specialists/${id}/services`)
  }

  getService(id: string, serviceId: string): Promise<AxiosResponse<Service>> {
    return this._config.instance.get(`/api/specialists/${id}/services/${serviceId}`)
  }

  create(data: SpecialistCreateBody): Promise<AxiosResponse<Id>> {
    return this._config.instance.post(`/api/specialists`, data)
  }

  update(id: string, data: SpecialistUpdateBody): Promise<AxiosResponse<Id>> {
    return this._config.instance.put(`/api/specialists/${id}`, data)
  }

  delete(id: string): Promise<AxiosResponse<void>> {
    return this._config.instance.delete(`/api/specialists/${id}`)
  }
}

export type Specialist = {
  id: string
  name: string
  email: string
  phone: string
  birthdate: string
  cpf: string
  cnpj: string
}

export type SpecialistsCountAllQuery = {
  name?: string
  phone?: string
  cpf?: string
}
export type SpecialistsGetAllQuery = SpecialistsCountAllQuery & {
  page?: number
  pageSize?: number
}

export type GetSpecialistAppointmentQuery = {
  date?: string
}

export type SpecialistsCreateBodyService = {
  serviceNameId: string
  price: number
  duration: number // minutes
}

export type SpecialistCreateBody = {
  name: string
  email: string
  phone: string
  birthdate: string
  cpf: string
  cnpj: string
  services: SpecialistsCreateBodyService[]
}

export type SpecialistUpdateBody = {
  name: string
  email: string
  phone: string
  birthdate: string
  cpf: string
  cnpj: string
  services: SpecialistsCreateBodyService[]
}

export type SpecialistAppointment = {
  id: string
  customerName: string
  customerId: string
  serviceName: string
  serviceNameId: string
  price: number
  duration: number
  date: string
  time: string
  status: number
}

export type SpecialistService = {
  id: string
  serviceId: string
  specializationId: string
  serviceName: string
  serviceNameId: string
  price: number
  duration: number
}

export type Specialization = {
  id: string
  name: string
}
