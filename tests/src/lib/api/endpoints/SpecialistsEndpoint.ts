import { AxiosResponse } from "axios"
import { Config } from "../Config"
import { SpecialistService, Specialist } from "../validation"

export class SpecialistsEndpoint {
  constructor(public config: Config) {}

  list(params: SpecialistListParams = {}): Promise<AxiosResponse<Specialist[]>> {
    return this.config.instance.get(`/specialists`, { params })
  }

  create(data: UpsertSpecialistBody): Promise<AxiosResponse<string>> {
    return this.config.instance.post(`/specialists`, data)
  }

  count(): Promise<AxiosResponse<number>> {
    return this.config.instance.get(`/specialists/count`)
  }

  get(specialistId: string): Promise<AxiosResponse<Specialist>> {
    return this.config.instance.get(`/specialists/${specialistId}`)
  }

  update(specialistId: string, data: UpsertSpecialistBody): Promise<AxiosResponse<any>> {
    return this.config.instance.put(`/specialists/${specialistId}`, data)
  }

  remove(specialistId: string): Promise<AxiosResponse<void>> {
    return this.config.instance.delete(`/specialists/${specialistId}`)
  }

  listAppointments(specialistId: string): Promise<AxiosResponse<any>> {
    return this.config.instance.get(`/specialists/${specialistId}/appointments`)
  }

  listSpecializations(specialistId: string): Promise<AxiosResponse<any>> {
    return this.config.instance.get(`/specialists/${specialistId}/specializations`)
  }

  listServices(specialistId: string): Promise<AxiosResponse<SpecialistService[]>> {
    return this.config.instance.get(`/specialists/${specialistId}/services`)
  }
}

export type SpecialistListParams = Partial<{
  page: number
  pageSize: number
}>

export type SpecialistServiceInfoBody = {
  serviceNameId: string
  price: number
  duration: number
}

export type UpsertSpecialistBody = {
  name: string,
  email: string,
  phone: string,
  birthdate: string,
  cpf: string,
  cnpj: string,
  services: Array<SpecialistServiceInfoBody>
}
