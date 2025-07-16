import { AxiosResponse } from "axios"
import { Config } from "../Config"

export class ServiceGroupsEndpoint {
  constructor(public config: Config) {}

  list(): Promise<AxiosResponse<any>> {
    return this.config.instance.get(`/service-groups`)
  }
}
