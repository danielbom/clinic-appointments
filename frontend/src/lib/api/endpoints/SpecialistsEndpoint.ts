import { type AxiosResponse } from 'axios'
import { type Config } from '../Config'
import { type Service } from './ServicesEndpoint'
import { type Id } from './types'

export class SpecialistsEndpoint {
  constructor(public _config: Config) {}

  async getById(id: string): Promise<AxiosResponse<Specialist>> {
    return await this._config.instance.get(`/api/specialists/${id}`)
  }

  async getAll(query: SpecialistsGetAllQuery = {}): Promise<AxiosResponse<Specialist[]>> {
    return await this._config.instance.get(`/api/specialists`, { params: query })
  }

  async count(query: SpecialistsCountAllQuery = {}): Promise<AxiosResponse<number>> {
    return await this._config.instance.get(`/api/specialists/count`, { params: query })
  }

  async getAppointments(
    id: string,
    query: GetSpecialistAppointmentQuery = {},
  ): Promise<AxiosResponse<SpecialistAppointment[]>> {
    return await this._config.instance.get(`/api/specialists/${id}/appointments`, { params: query })
  }

  async getSpecializations(id: string): Promise<AxiosResponse<Specialization[]>> {
    return await this._config.instance.get(`/api/specialists/${id}/specializations`)
  }

  async getServices(id: string): Promise<AxiosResponse<SpecialistService[]>> {
    return await this._config.instance.get(`/api/specialists/${id}/services`)
  }

  async getService(id: string, serviceId: string): Promise<AxiosResponse<Service>> {
    return await this._config.instance.get(`/api/specialists/${id}/services/${serviceId}`)
  }

  async create(data: SpecialistCreateBody): Promise<AxiosResponse<Id>> {
    return await this._config.instance.post(`/api/specialists`, data)
  }

  async update(id: string, data: SpecialistUpdateBody): Promise<AxiosResponse<Id>> {
    return await this._config.instance.put(`/api/specialists/${id}`, data)
  }

  async delete(id: string): Promise<AxiosResponse<void>> {
    return await this._config.instance.delete(`/api/specialists/${id}`)
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
  cnpj?: string
}
export type SpecialistsGetAllQuery = SpecialistsCountAllQuery & {
  page?: number
  pageSize?: number
}

export type GetSpecialistAppointmentQuery = {
  date?: string
}

export type SpecialistCreateBodyService = {
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
  services: SpecialistCreateBodyService[]
}

export type SpecialistUpdateBody = {
  name: string
  email: string
  phone: string
  birthdate: string
  cpf: string
  cnpj: string
  services: SpecialistCreateBodyService[]
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
