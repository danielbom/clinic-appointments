import { AxiosResponse } from 'axios'
import { Config } from '../Config'

export class ServicesEndpoint {
  constructor(public _config: Config) {}

  getAll(query: ServicesGetAllQuery = {}): Promise<AxiosResponse<Service[]>> {
    return this._config.instance.get('/services', { params: query })
  }

  count(query: ServicesCountQuery = {}): Promise<AxiosResponse<number>> {
    return this._config.instance.get('/services/count', { params: query })
  }

  getById(id: string): Promise<AxiosResponse<Service>> {
    return this._config.instance.get(`/services/${id}`)
  }

  create(data: ServicesCreateBody): Promise<AxiosResponse<string>> {
    return this._config.instance.post('/services', data)
  }

  update(id: string, data: ServicesUpdateBody): Promise<AxiosResponse<any>> {
    return this._config.instance.put(`/services/${id}`, data)
  }

  delete(id: string): Promise<AxiosResponse<void>> {
    return this._config.instance.delete(`/services/${id}`)
  }
}

export type Service = {
  id: string
  serviceName: string
  serviceNameId: string
  specialistName: string
  specialistId: string
  specialization: string
  specializationId: string
  price: number
  duration: number
}

export type ServicesCountQuery = {
  service?: string
  specialist?: string
  specialization?: string
}

export type ServicesGetAllQuery = {
  page?: number
  pageSize?: number
  service?: string
  specialization?: string
  specialist?: string
}

export type ServicesCreateBody = {
  specialistId: string
  serviceNameId: string
  price: number
  duration: number
}

export type ServicesUpdateBody = {
  serviceNameId: string
  price: number
  duration: number
}
