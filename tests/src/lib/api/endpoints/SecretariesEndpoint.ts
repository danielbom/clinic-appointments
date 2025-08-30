import { AxiosResponse } from 'axios'
import { Config } from '../Config'

export class SecretariesEndpoint {
  constructor(public _config: Config) {}

  getAll(query: SecretariesGetAllQuery = {}): Promise<AxiosResponse<Secretary[]>> {
    return this._config.instance.get(`/secretaries`, { params: query })
  }

  count(query: SecretariesCountAllQuery = {}): Promise<AxiosResponse<number>> {
    return this._config.instance.get(`/secretaries/count`, { params: query })
  }

  getById(id: string): Promise<AxiosResponse<Secretary>> {
    return this._config.instance.get(`/secretaries/${id}`)
  }

  create(data: SecretariesCreateBody): Promise<AxiosResponse<Secretary>> {
    return this._config.instance.post(`/secretaries`, data)
  }

  update(id: string, data: SecretariesUpdateBody): Promise<AxiosResponse<any>> {
    return this._config.instance.put(`/secretaries/${id}`, data)
  }

  delete(id: string): Promise<AxiosResponse<void>> {
    return this._config.instance.delete(`/secretaries/${id}`)
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

export type SecretariesCreateBody = {
  name: string
  email: string
  phone: string
  birthdate: string
  password: string
  cpf: string
  cnpj: string
}

export type SecretariesUpdateBody = {
  name: string
  email: string
  phone: string
  birthdate: string
  password?: string
  cpf: string
  cnpj: string
}
