import { AxiosResponse } from "axios"
import { Config } from "../Config"

export class HealthEndpoint {
  constructor(public config: Config) {}

  healthCheck(): Promise<AxiosResponse<any>> {
    return this.config.instance.get(`/health`)
  }
}
