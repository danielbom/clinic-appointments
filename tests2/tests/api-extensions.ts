import { AxiosResponse } from 'axios'

export function responseIsError(res: AxiosResponse<any>): res is AxiosResponse<string> {
  return res.status >= 400
}
