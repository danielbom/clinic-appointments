import { AxiosResponse } from "axios"
import { Config } from "../Config"

export class SpecializationsEndpoint {
  constructor(public config: Config) {}

  list(): Promise<AxiosResponse<any>> {
    return this.config.instance.get(`/specializations`)
  }

  create(data: UpsertSpecializationBody): Promise<AxiosResponse<any>> {
    return this.config.instance.post(`/specializations`, data)
  }

  update(specializationId: string, data: UpsertSpecializationBody): Promise<AxiosResponse<any>> {
    return this.config.instance.put(`/specializations/${specializationId}`, data)
  }

  remove(specializationId: string): Promise<AxiosResponse<any>> {
    return this.config.instance.delete(`/specializations/${specializationId}`)
  }
}

export type UpsertSpecializationBody = {
  name: string
}
