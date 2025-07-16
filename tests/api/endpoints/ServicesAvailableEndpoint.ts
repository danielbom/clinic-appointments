import { AxiosResponse } from "axios"
import { Config } from "../Config"

export class ServicesAvailableEndpoint {
  constructor(public config: Config) {}

  list(): Promise<AxiosResponse<any>> {
    return this.config.instance.get(`/services-available`)
  }

  _count(): Promise<AxiosResponse<number>> {
    return this.list().then(res => {
      res.data = res.data.flatMap((it: any) => it.items.length).reduce((a: number, b: number) => a + b, 0)
      return res
    })
  }

  create(data: CreateServiceAvailableBody): Promise<AxiosResponse<any>> {
    return this.config.instance.post(`/services-available`, data)
  }

  get(serviceId: string): Promise<AxiosResponse<any>> {
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
  name: string,
  specialization?: string,
  specializationId?: string
}

export type UpdateServiceAvailableBody = {
  name: string
}
