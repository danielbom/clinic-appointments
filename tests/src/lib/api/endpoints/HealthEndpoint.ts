import { type AxiosResponse } from 'axios'
import { type Config } from '../Config'

export class HealthEndpoint {
  constructor(public _config: Config) {}

  async healthCheck(): Promise<AxiosResponse<Status>> {
    return await this._config.instance.get(`/api/health`)
  }
}

export type Status = {
  status: boolean
  updatedAt: string
  environment: string
  database: {
    status: string
    version: string
    maxConnections: number
    openedConnections: number
  }
}
