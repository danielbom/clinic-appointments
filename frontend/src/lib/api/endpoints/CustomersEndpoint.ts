import { type AxiosResponse } from 'axios'
import { type Config } from '../Config'
import { type Id } from './types'

export class CustomersEndpoint {
  constructor(public _config: Config) {}

  getAll(query: CustomersGetAllQuery = {}): Promise<AxiosResponse<Customer[]>> {
    return this._config.instance.get(`/api/customers`, { params: query })
  }

  count(query: CustomersCountAllQuery = {}): Promise<AxiosResponse<number>> {
    return this._config.instance.get(`/api/customers/count`, { params: query })
  }

  getById(id: string): Promise<AxiosResponse<Customer>> {
    return this._config.instance.get(`/api/customers/${id}`)
  }

  create(data: CustomerCreateBody): Promise<AxiosResponse<Id>> {
    return this._config.instance.post(`/api/customers`, data)
  }

  update(id: string, data: CustomerUpdateBody): Promise<AxiosResponse<Id>> {
    return this._config.instance.put(`/api/customers/${id}`, data)
  }

  delete(id: string): Promise<AxiosResponse<void>> {
    return this._config.instance.delete(`/api/customers/${id}`)
  }
}

export type Customer = {
  id: string
  name: string
  email: string
  phone: string
  birthdate: string
  cpf: string
}

export type CustomersCountAllQuery = {
  name?: string
  phone?: string
  // email?: string
  cpf?: string
}

export type CustomersGetAllQuery = CustomersCountAllQuery & {
  page?: number
  pageSize?: number
}

export type CustomerCreateBody = {
  name: string
  email: string
  phone: string
  birthdate: string
  cpf: string
}

export type CustomerUpdateBody = {
  name: string
  email: string
  phone: string
  birthdate: string
  cpf: string
}
