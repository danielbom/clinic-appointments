import { type AxiosResponse } from 'axios'
import { type Config } from '../Config'
import { type Id } from './types'

export class CustomersEndpoint {
  constructor(public _config: Config) {}

  async getAll(query: CustomersGetAllQuery = {}): Promise<AxiosResponse<Customer[]>> {
    return await this._config.instance.get(`/api/customers`, { params: query })
  }

  async count(query: CustomersCountAllQuery = {}): Promise<AxiosResponse<number>> {
    return await this._config.instance.get(`/api/customers/count`, { params: query })
  }

  async getById(id: string): Promise<AxiosResponse<Customer>> {
    return await this._config.instance.get(`/api/customers/${id}`)
  }

  async create(data: CustomerCreateBody): Promise<AxiosResponse<Id>> {
    return await this._config.instance.post(`/api/customers`, data)
  }

  async update(id: string, data: CustomerUpdateBody): Promise<AxiosResponse<Id>> {
    return await this._config.instance.put(`/api/customers/${id}`, data)
  }

  async delete(id: string): Promise<AxiosResponse<void>> {
    return await this._config.instance.delete(`/api/customers/${id}`)
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
