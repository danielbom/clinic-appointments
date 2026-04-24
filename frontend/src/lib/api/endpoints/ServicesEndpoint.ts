import { type AxiosResponse } from 'axios'
import { type Config } from '../Config'
import { type Id } from './types'

export class ServicesEndpoint {
  constructor(public _config: Config) {}

  async getAll(query: ServicesGetAllQuery = {}): Promise<AxiosResponse<Service[]>> {
    return await this._config.instance.get('/api/services', { params: query })
  }

  async count(query: ServicesCountQuery = {}): Promise<AxiosResponse<number>> {
    return await this._config.instance.get('/api/services/count', { params: query })
  }

  async getById(id: string): Promise<AxiosResponse<Service>> {
    return await this._config.instance.get(`/api/services/${id}`)
  }

  async create(data: ServiceCreateBody): Promise<AxiosResponse<Id>> {
    return await this._config.instance.post('/api/services', data)
  }

  async update(id: string, data: ServiceUpdateBody): Promise<AxiosResponse<Id>> {
    return await this._config.instance.put(`/api/services/${id}`, data)
  }

  async delete(id: string): Promise<AxiosResponse<void>> {
    return await this._config.instance.delete(`/api/services/${id}`)
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

export type ServiceCreateBody = {
  specialistId: string
  serviceNameId: string
  price: number
  duration: number
}

export type ServiceUpdateBody = {
  serviceNameId: string
  price: number
  duration: number
}
