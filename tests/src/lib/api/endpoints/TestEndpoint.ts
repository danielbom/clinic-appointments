import { AxiosResponse } from "axios"
import { Config } from "../Config"

export class TestEndpoint {
  constructor(public _config: Config) {}

  stats(): Promise<AxiosResponse<any>> {
    return this._config.instance.get(`/test/stats`)
  }

  init(): Promise<AxiosResponse<any>> {
    return this._config.instance.get(`/test/init`)
  }

  debugClaims(): Promise<AxiosResponse<any>> {
    return this._config.instance.get(`/test/debug-claims`)
  }
}
