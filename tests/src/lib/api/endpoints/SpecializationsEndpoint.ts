import { type AxiosResponse } from 'axios'
import { type Config } from '../Config'
import { type Id } from './types'

export class SpecializationsEndpoint {
  constructor(public _config: Config) {}

  getAll(): Promise<AxiosResponse<Specialization[]>> {
    return this._config.instance.get(`/api/specializations`)
  }

  create(data: SpecializationCreateBody): Promise<AxiosResponse<Id>> {
    return this._config.instance.post(`/api/specializations`, data)
  }

  update(id: string, data: SpecializationUpdateBody): Promise<AxiosResponse<Id>> {
    return this._config.instance.put(`/api/specializations/${id}`, data)
  }

  delete(id: string): Promise<AxiosResponse<void>> {
    return this._config.instance.delete(`/api/specializations/${id}`)
  }
}

type Specialization = {
  id: string
  name: string
}

export type SpecializationCreateBody = {
  name: string
}

export type SpecializationUpdateBody = {
  name: string
}
