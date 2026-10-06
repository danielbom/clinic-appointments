import { type AxiosResponse } from 'axios'
import { type Config } from '../Config'

export class TestEndpoint {
  constructor(public _config: Config) {}

  async stats(): Promise<AxiosResponse<any>> {
    return await this._config.instance.get(`/api/test/stats`)
  }

  async debugClaims(): Promise<AxiosResponse<any>> {
    return await this._config.instance.get(`/api/test/debug-claims`)
  }

  async dispatch(data: TestDispatchBody): Promise<AxiosResponse<void>> {
    return await this._config.instance.post(`/api/test/dispatch`, data)
  }
}

export type TestDispatchBody = { kind: 'INIT' } //
