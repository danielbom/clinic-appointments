import { AxiosResponse } from 'axios'
import { Config } from '../Config'
import { Service, ServiceBase } from '../validation'

export class ServicesEndpoint {
  constructor(public config: Config) {}

  list(params?: ServiceListParams): Promise<AxiosResponse<Service[]>> {
    return this.config.instance.get(`/services`, { params })
  }

  create(data: CreateServiceBody): Promise<AxiosResponse<string>> {
    return this.config.instance.post(`/services`, data)
  }

  count(params?: ServiceCountParams): Promise<AxiosResponse<number>> {
    return this.config.instance.get(`/services/count`, { params })
  }

  get(serviceId: string): Promise<AxiosResponse<ServiceBase>> {
    return this.config.instance.get(`/services/${serviceId}`)
  }

  update(serviceId: string, data: UpdateServiceBody): Promise<AxiosResponse<string>> {
    return this.config.instance.put(`/services/${serviceId}`, data)
  }

  remove(serviceId: string): Promise<AxiosResponse<void>> {
    return this.config.instance.delete(`/services/${serviceId}`)
  }
}

export type UpdateServiceBody = {
  price: number
  duration: number
  serviceNameId: string
}

export type CreateServiceBody = UpdateServiceBody & {
  specialistId: string
}

export type ServiceCountParams = {
  specialist?: string
  service?: string
  specialization?: string
}
export type ServiceListParams = ServiceCountParams & {
  page?: number
  pageSize?: number
}
