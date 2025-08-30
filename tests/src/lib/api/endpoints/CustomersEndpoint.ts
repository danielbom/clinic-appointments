import { AxiosResponse } from 'axios'
import { Config } from '../Config'

export class CustomersEndpoint {
  constructor(public _config: Config) {}

  getAll(query: CustomersGetAllQuery = {}): Promise<AxiosResponse<Customer[]>> {
    return this._config.instance.get(`/customers`, { params: query })
  }

  count(query: CustomersCountAllQuery = {}): Promise<AxiosResponse<number>> {
    return this._config.instance.get(`/customers/count`, { params: query })
  }

  getById(id: string): Promise<AxiosResponse<Customer>> {
    return this._config.instance.get(`/customers/${id}`)
  }

  create(data: CustomersCreateBody): Promise<AxiosResponse<string>> {
    return this._config.instance.post(`/customers`, data)
  }

  update(id: string, data: CustomersUpdateBody): Promise<AxiosResponse<any>> {
    return this._config.instance.put(`/customers/${id}`, data)
  }

  delete(id: string): Promise<AxiosResponse<void>> {
    return this._config.instance.delete(`/customers/${id}`)
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

export type CustomersCreateBody = {
  name: string
  email: string
  phone: string
  birthdate: string
  cpf: string
}

export type CustomersUpdateBody = {
  name: string
  email: string
  phone: string
  birthdate: string
  cpf: string
}
