import { type AxiosResponse } from 'axios'
import { type Config } from '../Config'

export class ServiceGroupsEndpoint {
  constructor(public _config: Config) {}

  getAll(): Promise<AxiosResponse<ServiceGroup[]>> {
    return this._config.instance.get(`/api/service-groups`)
  }
}

export type ServiceGroupItem = {
  id: string
  name: string
}

export type ServiceGroup = {
  id: string
  name: string
  items: ServiceGroupItem[]
}
