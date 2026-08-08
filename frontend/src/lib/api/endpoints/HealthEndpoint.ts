import { type AxiosResponse } from 'axios'
import { type Config } from '../Config'

export class HealthEndpoint {
  constructor(public _config: Config) {}

  async healthCheck(): Promise<AxiosResponse<HealthResponse>> {
    return await this._config.instance.get(`/api/health/check`)
  }

  async healthLiveness(): Promise<AxiosResponse<HealthResponse>> {
    return await this._config.instance.get(`/api/health/liveness`)
  }

  async healthReadiness(): Promise<AxiosResponse<HealthResponse>> {
    return await this._config.instance.get(`/api/health/readiness`)
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
