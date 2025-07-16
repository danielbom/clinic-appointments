import { AxiosResponse } from "axios"
import { Config } from "../Config"

export class ServicesEndpoint {
  constructor(public config: Config) {}

  list(page: number, pageSize: number, specialist: string, service: string, specialization: string): Promise<AxiosResponse<any>> {
    return this.config.instance.get(`/services`)
  }

  create(data: UpsertServiceBody): Promise<AxiosResponse<any>> {
    return this.config.instance.post(`/services`, data)
  }

  count(specialist: string, service: string, specialization: string): Promise<AxiosResponse<any>> {
    return this.config.instance.get(`/services/count`)
  }

  get(serviceId: string): Promise<AxiosResponse<any>> {
    return this.config.instance.get(`/services/${serviceId}`)
  }

  update(serviceId: string, data: UpsertServiceBody): Promise<AxiosResponse<any>> {
    return this.config.instance.put(`/services/${serviceId}`, data)
  }

  remove(serviceId: string): Promise<AxiosResponse<any>> {
    return this.config.instance.delete(`/services/${serviceId}`)
  }
}

export type UpsertServiceBody = {
  specialistId: string,
  serviceNameId: string,
  price: number,
  duration: number
}
