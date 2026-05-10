import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import type { Config } from '../Config'

export class AuthEndpoint {
  constructor(public _config: Config) {}

  async login(data: AuthLoginBody, config?: AxiosRequestConfig): Promise<AxiosResponse<AuthLoginResponse>> {
    return await this._config.instance.post(`/api/auth/login`, data, config)
  }

  async refresh(refreshToken: string): Promise<AxiosResponse<AuthLoginResponse>> {
    return await this._config.instance.post(`/api/auth/refresh`, null, {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    })
  }

  async me(): Promise<AxiosResponse<Identity>> {
    return await this._config.instance.get(`/api/auth/me`)
  }
}

export type AuthLoginBody = {
  email: string
  password: string
}

export type AuthLoginResponse = {
  accessToken: string
  refreshToken: string
}

export type Identity = {
  id: number
  email: string
  name: string
  role: string
}
