import { AxiosResponse } from 'axios'
import { Config } from '../Config'

export class SpecialistsEndpoint {
  constructor(public _config: Config) {}

  getById(id: string): Promise<AxiosResponse<Specialist>> {
    return this._config.instance.get(`/specialists/${id}`)
  }

  getAll(query: SpecialistsGetAllQuery = {}): Promise<AxiosResponse<Specialist[]>> {
    return this._config.instance.get(`/specialists`, { params: query })
  }

  count(query: SpecialistsCountAllQuery = {}): Promise<AxiosResponse<number>> {
    return this._config.instance.get(`/specialists/count`, { params: query })
  }

  getAppointments(
    id: string,
    query: GetSpecialistAppointmentQuery = {},
  ): Promise<AxiosResponse<SpecialistAppointment[]>> {
    return this._config.instance.get(`/specialists/${id}/appointments`, { params: query })
  }

  getSpecializations(id: string): Promise<AxiosResponse<Specialization[]>> {
    return this._config.instance.get(`/specialists/${id}/specializations`)
  }

  getServices(id: string): Promise<AxiosResponse<SpecialistService[]>> {
    return this._config.instance.get(`/specialists/${id}/services`)
  }

  create(data: SpecialistsCreateBody): Promise<AxiosResponse<string>> {
    return this._config.instance.post(`/specialists`, data)
  }

  update(id: string, data: SpecialistsUpdateBody): Promise<AxiosResponse<any>> {
    return this._config.instance.put(`/specialists/${id}`, data)
  }

  delete(id: string): Promise<AxiosResponse<void>> {
    return this._config.instance.delete(`/specialists/${id}`)
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

export type SpecialistsCreateBody = {
  name: string
  email: string
  phone: string
  birthdate: string
  cpf: string
  cnpj: string
  services: SpecialistsCreateBodyService[]
}

export type SpecialistsUpdateBody = {
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
  serviceId: string
  price: number
  duration: number
  date: string
  time: string
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
