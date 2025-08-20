import { AxiosResponse } from "axios"
import { Config } from "../Config"
import { ServiceGroups } from "../validation"

export class ServiceGroupsEndpoint {
  constructor(public config: Config) {}

  list(): Promise<AxiosResponse<ServiceGroups>> {
    return this.config.instance.get(`/service-groups`)
  }
}
