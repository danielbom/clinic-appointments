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
