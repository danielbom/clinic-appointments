import { type AxiosResponse } from 'axios'
import { type Config } from '../Config'
import { type Id } from './types'

export class ServicesAvailableEndpoint {
  constructor(public _config: Config) {}

  async getAll(): Promise<AxiosResponse<ServiceAvailableGroup[]>> {
    return await this._config.instance.get(`/api/services-available`)
  }

  async getById(id: string): Promise<AxiosResponse<ServiceAvailable>> {
    return await this._config.instance.get(`/api/services-available/${id}`)
  }

  async create(data: ServiceAvailableCreateBody): Promise<AxiosResponse<Id>> {
    return await this._config.instance.post(`/api/services-available`, data)
  }

  async update(id: string, data: ServiceAvailableUpdateBody): Promise<AxiosResponse<Id>> {
    return await this._config.instance.put(`/api/services-available/${id}`, data)
  }

  async delete(id: string): Promise<AxiosResponse<void>> {
    return await this._config.instance.delete(`/api/services-available/${id}`)
  }
}

export type ServiceAvailable = {
  serviceName: string
  serviceNameId: string
  specialization: string
  specializationId: string
}

export type ServiceAvailableGroupItem = {
  id: string
  name: string
}

export type ServiceAvailableGroup = {
  id: string
  name: string
  items: ServiceAvailableGroupItem[]
}

export type ServiceAvailableCreateBody = {
  name: string
  specialization?: string
  specializationId?: string
}

export type ServiceAvailableUpdateBody = {
  name: string
}
