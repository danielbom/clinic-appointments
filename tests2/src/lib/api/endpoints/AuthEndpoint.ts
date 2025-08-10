import { AxiosRequestConfig, AxiosResponse } from 'axios'
import { Config } from '../Config'
import { AuthToken, AuthMe } from '../validation'

export class AuthEndpoint {
  constructor(public config: Config) {}

  login(data: LoginBody): Promise<AxiosResponse<AuthToken>> {
    return this.config.instance.post(`/auth/login`, data)
  }

  refresh(config: AxiosRequestConfig): Promise<AxiosResponse<AuthToken>> {
    return this.config.instance.post(`/auth/refresh`, null, config)
  }

  me(): Promise<AxiosResponse<AuthMe>> {
    return this.config.instance.get(`/auth/me`)
  }
}

export type LoginBody = {
  email: string
  password: string
}
