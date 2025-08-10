import { AxiosResponse } from "axios"
import { Config } from "../Config"
import { Specialization } from "../validation/Specialization"

export class SpecializationsEndpoint {
  constructor(public config: Config) {}

  list(): Promise<AxiosResponse<Specialization[]>> {
    return this.config.instance.get(`/specializations`)
  }

  create(data: UpsertSpecializationBody): Promise<AxiosResponse<string>> {
    return this.config.instance.post(`/specializations`, data)
  }

  update(specializationId: string, data: UpsertSpecializationBody): Promise<AxiosResponse<any>> {
    return this.config.instance.put(`/specializations/${specializationId}`, data)
  }

  remove(specializationId: string): Promise<AxiosResponse<void>> {
    return this.config.instance.delete(`/specializations/${specializationId}`)
  }
}

export type UpsertSpecializationBody = {
  name: string
}
