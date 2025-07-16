import { AxiosResponse } from 'axios'
import { Config } from '../Config'

export class ServicesAvailableEndpoint {
  constructor(public _config: Config) {}

  getAll(): Promise<AxiosResponse<ServiceAvailableGroup[]>> {
    return this._config.instance.get(`/services-available`)
  }

  getById(id: string): Promise<AxiosResponse<ServiceAvailable>> {
    return this._config.instance.get(`/services-available/${id}`)
  }

  create(data: ServiceAvailableCreateBody): Promise<AxiosResponse<string>> {
    return this._config.instance.post(`/services-available`, data)
  }

  update(id: string, data: ServiceAvailableUpdateBody): Promise<AxiosResponse<string>> {
    return this._config.instance.put(`/services-available/${id}`, data)
  }

  delete(id: string): Promise<AxiosResponse<void>> {
    return this._config.instance.delete(`/services-available/${id}`)
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
  specialization: string
  specializationId: string
}

export type ServiceAvailableUpdateBody = {
  name: string
}
