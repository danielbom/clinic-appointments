import { AxiosResponse } from 'axios'
import { Config } from '../Config'

export class SecretariesEndpoint {
  constructor(public config: Config) {}

  list(query?: SecretaryListQuery): Promise<AxiosResponse<any>> {
    return this.config.instance.get(`/secretaries`, { params: query })
  }

  create(data: UpsertSecretaryBody): Promise<AxiosResponse<any>> {
    return this.config.instance.post(`/secretaries`, data)
  }

  count(query?: SecretaryCountQuery): Promise<AxiosResponse<number>> {
    return this.config.instance.get(`/secretaries/count`, { params: query })
  }

  get(secretaryId: string): Promise<AxiosResponse<any>> {
    return this.config.instance.get(`/secretaries/${secretaryId}`)
  }

  update(secretaryId: string, data: UpsertSecretaryBody): Promise<AxiosResponse<any>> {
    return this.config.instance.put(`/secretaries/${secretaryId}`, data)
  }

  remove(secretaryId: string): Promise<AxiosResponse<any>> {
    return this.config.instance.delete(`/secretaries/${secretaryId}`)
  }
}

export type SecretaryListQuery = Partial<{
  page: number
  pageSize: number
  name: string
  cpf: string
  cnpj: string
  phone: string
}>

export type SecretaryCountQuery = Partial<{
  name: string
  cpf: string
  cnpj: string
  phone: string
}>

export type UpsertSecretaryBody = {
  name: string
  email: string
  phone: string
  birthdate: string
  password: string | undefined
  cpf: string
  cnpj: string
}
