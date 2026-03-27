import { AxiosResponse } from 'axios'
import { Config } from '../Config'

export class HealthEndpoint {
  constructor(public config: Config) {}

  healthCheck(): Promise<AxiosResponse<Status>> {
    return this.config.instance.get(`/api/health`)
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
