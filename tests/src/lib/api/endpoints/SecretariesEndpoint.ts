import { type AxiosResponse } from 'axios'
import { type Config } from '../Config'
import { type Id } from './types'

export class SecretariesEndpoint {
  constructor(public _config: Config) {}

  getAll(query: SecretariesGetAllQuery = {}): Promise<AxiosResponse<Secretary[]>> {
    return this._config.instance.get(`/api/secretaries`, { params: query })
  }

  count(query: SecretariesCountAllQuery = {}): Promise<AxiosResponse<number>> {
    return this._config.instance.get(`/api/secretaries/count`, { params: query })
  }

  getById(id: string): Promise<AxiosResponse<Secretary>> {
    return this._config.instance.get(`/api/secretaries/${id}`)
  }

  create(data: SecretaryCreateBody): Promise<AxiosResponse<Id>> {
    return this._config.instance.post(`/api/secretaries`, data)
  }

  update(id: string, data: SecretaryUpdateBody): Promise<AxiosResponse<Id>> {
    return this._config.instance.put(`/api/secretaries/${id}`, data)
  }

  delete(id: string): Promise<AxiosResponse<void>> {
    return this._config.instance.delete(`/api/secretaries/${id}`)
  }
}

export type Secretary = {
  id: string
  name: string
  email: string
  phone: string
  birthdate: string
  cpf: string
  cnpj: string
}

export type SecretariesCountAllQuery = {
  name?: string
  phone?: string
  // email?: string
  cpf?: string
  cnpj?: string
}

export type SecretariesGetAllQuery = SecretariesCountAllQuery & {
  page?: number
  pageSize?: number
}

export type SecretaryCreateBody = {
  name: string
  email: string
  phone: string
  birthdate: string
  password: string
  cpf: string
  cnpj: string
}

export type SecretaryUpdateBody = {
  name: string
  email: string
  phone: string
  birthdate: string
  password?: string
  cpf: string
  cnpj: string
}
