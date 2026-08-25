import { type AxiosResponse } from 'axios'
import { type Config } from '../Config'

export class HealthEndpoint {
  constructor(public _config: Config) {}

  async check(): Promise<AxiosResponse<HealthResponse>> {
    return await this._config.instance.get(`/api/health/check`)
  }

  async isAlive(): Promise<AxiosResponse<HealthResponse>> {
    return await this._config.instance.get(`/api/health/live`)
  }

  async isReady(): Promise<AxiosResponse<HealthResponse>> {
    return await this._config.instance.get(`/api/health/ready`)
  }
}

type HealthStatus = 'UP' | 'DEGRADED' | 'DOWN'
export type HealthResponse = {
  status: HealthStatus
  timestamp: string
  environment: string
  details?: {
    database: {
      latencyMs: number
      status: HealthStatus
      version?: string
      maxConnections?: number
      openedConnections?: number
    }
  }
}
