import { type AxiosResponse } from 'axios'
import { type Config } from '../Config'

export class TestEndpoint {
  constructor(public _config: Config) {}

  async stats(): Promise<AxiosResponse<any>> {
    return await this._config.instance.get(`/api/test/stats`)
  }

  async init(): Promise<AxiosResponse<any>> {
    return await this._config.instance.get(`/api/test/init`)
  }

  async debugClaims(): Promise<AxiosResponse<any>> {
    return await this._config.instance.get(`/api/test/debug-claims`)
  }
}
