import { AxiosResponse } from "axios"
import { Config } from "../Config"

export class AuthEndpoint {
  constructor(public config: Config) {}

  login(data: LoginBody): Promise<AxiosResponse<any>> {
    return this.config.instance.post(`/auth/login`, data)
  }

  refresh(data: any): Promise<AxiosResponse<any>> {
    return this.config.instance.post(`/auth/refresh`, data)
  }

  me(): Promise<AxiosResponse<any>> {
    return this.config.instance.get(`/auth/me`)
  }
}

export type LoginBody = {
  email: string,
  password: string
}
