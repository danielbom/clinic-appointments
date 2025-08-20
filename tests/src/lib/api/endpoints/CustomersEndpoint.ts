import { AxiosResponse } from 'axios'
import { Config } from '../Config'

export class CustomersEndpoint {
  constructor(public config: Config) {}

  list(params?: CustomersListQuery): Promise<AxiosResponse<any>> {
    return this.config.instance.get(`/customers`, { params })
  }

  create(data: UpsertCustomerBody): Promise<AxiosResponse<any>> {
    return this.config.instance.post(`/customers`, data)
  }

  count(params?: CustomersCountQuery): Promise<AxiosResponse<any>> {
    return this.config.instance.get(`/customers/count`, { params })
  }

  get(customerId: string): Promise<AxiosResponse<any>> {
    return this.config.instance.get(`/customers/${customerId}`)
  }

  update(customerId: string, data: UpsertCustomerBody): Promise<AxiosResponse<any>> {
    return this.config.instance.put(`/customers/${customerId}`, data)
  }

  remove(customerId: string): Promise<AxiosResponse<any>> {
    return this.config.instance.delete(`/customers/${customerId}`)
  }
}

export type CustomersCountQuery = Partial<{
  name: string
  cpf: string
  phone: string
}>

export type CustomersListQuery = Partial<{
  page: number
  pageSize: number
  name: string
  cpf: string
  phone: string
}>

export type UpsertCustomerBody = {
  name: string
  email: string
  phone: string
  birthdate: string
  cpf: string
}
