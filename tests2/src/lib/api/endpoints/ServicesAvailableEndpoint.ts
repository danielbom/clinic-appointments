import { AxiosResponse } from 'axios'
import { Config } from '../Config'
import { ServiceAvailable } from '../validation'
import { ServiceAvailableList } from '../validation/ServiceAvailableList'

export class ServicesAvailableEndpoint {
  constructor(public config: Config) {}

  list(): Promise<AxiosResponse<ServiceAvailableList>> {
    return this.config.instance.get(`/services-available`)
  }

  create(data: CreateServiceAvailableBody): Promise<AxiosResponse<string>> {
    return this.config.instance.post(`/services-available`, data)
  }

  get(serviceId: string): Promise<AxiosResponse<ServiceAvailable>> {
    return this.config.instance.get(`/services-available/${serviceId}`)
  }

  update(serviceId: string, data: UpdateServiceAvailableBody): Promise<AxiosResponse<any>> {
    return this.config.instance.put(`/services-available/${serviceId}`, data)
  }

  remove(serviceId: string): Promise<AxiosResponse<any>> {
    return this.config.instance.delete(`/services-available/${serviceId}`)
  }
}

export type CreateServiceAvailableBody = {
  name: string
  specialization?: string
  specializationId?: string
}

export type UpdateServiceAvailableBody = {
  name: string
}
