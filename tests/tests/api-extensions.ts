import type { AxiosError, AxiosResponse } from 'axios'

export function responseIsError(res: AxiosResponse<any>): res is AxiosResponse<string> {
  return res.status >= 400
}

export function formatJson(obj: any): string {
  if (!obj || typeof obj !== 'object') {
    return String(obj)
  }
  const parts: string[] = []
  for (const key in obj) {
    const value = formatJson(obj[key])
    parts.push(`${key}=${value}`)
  }
  return '(' + parts.join(', ') + ')'
}

export default function isAxiosError(error: unknown): error is AxiosError {
  if (!error) return false
  if (typeof error !== 'object') return false
  return (error as AxiosError).isAxiosError === true
}

export function logResponse(response: AxiosResponse) {
  // https://github.com/horprogs/react-query/blob/7e69a716054958721288d34a26b30427c257aa3b/src/utils/mockApi.ts#L37
  if (!response) return
  const method = response.config.method?.toUpperCase() || 'UNKNOWN'
  const baseURL = response.config.baseURL
  const url = response.config.url
  if (!url) return
  const status = response.status
  console.groupCollapsed(`=> ${method} ${baseURL}${url} ${status}`)
  if (response.config.params) console.log('Params:', response.config.params)
  if (response.config.data) console.log('Body:', response.config.data)
  if (response.data) console.log('Response:', response.data)
  console.groupEnd()
}
