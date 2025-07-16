import { AxiosError } from 'axios'

export default function isAxiosError(error: unknown): error is AxiosError {
  if (!error) return false
  if (typeof error !== 'object') return false
  return (error as AxiosError).isAxiosError === true
}
