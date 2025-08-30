import { AxiosRequestConfig, AxiosResponse } from 'axios'
import { Config } from '../Config'

export class AuthEndpoint {
  constructor(public _config: Config) {}

  login(data: AuthLoginBody): Promise<AxiosResponse<AuthLoginResponse>> {
    return this._config.instance.post(`/auth/login`, data)
  }

  refresh(config: AxiosRequestConfig): Promise<AxiosResponse<AuthLoginResponse>> {
    return this._config.instance.post(`/auth/refresh`, null, config)
  }

  me(): Promise<AxiosResponse<Identity>> {
    return this._config.instance.get(`/auth/me`)
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
