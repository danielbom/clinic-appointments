import { type AxiosResponse } from 'axios'
import { type Config } from '../Config'

export class TestEndpoint {
  constructor(public _config: Config) {}

  stats(): Promise<AxiosResponse<any>> {
    return this._config.instance.get(`/api/test/stats`)
  }

  init(): Promise<AxiosResponse<any>> {
    return this._config.instance.get(`/api/test/init`)
  }

  debugClaims(): Promise<AxiosResponse<any>> {
    return this._config.instance.get(`/api/test/debug-claims`)
  }
}
