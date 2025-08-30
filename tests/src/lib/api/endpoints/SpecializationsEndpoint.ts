import { type AxiosResponse } from 'axios'
import { type Config } from '../Config'

export class SpecializationsEndpoint {
  constructor(public _config: Config) {}

  getAll(): Promise<AxiosResponse<Specialization[]>> {
    return this._config.instance.get(`/specializations`)
  }

  create(data: SpecializationsCreateBody): Promise<AxiosResponse<string>> {
    return this._config.instance.post(`/specializations`, data)
  }

  update(id: string, data: SpecializationsUpdateBody): Promise<AxiosResponse<any>> {
    return this._config.instance.put(`/specializations/${id}`, data)
  }

  delete(id: string): Promise<AxiosResponse<void>> {
    return this._config.instance.delete(`/specializations/${id}`)
  }
}

type Specialization = {
  id: string
  name: string
}

export type SpecializationsCreateBody = {
  name: string
}

export type SpecializationsUpdateBody = {
  name: string
}
