export class SimpleAxiosError extends Error {
  public code = ''
  public status = 0
  public config = {} as any
  public response = {
    data: undefined,
  }
  public constructor(error: any) {
    super(String(error))
    if (error) {
      this.code = error.code
      this.status = error.status
      this.response.data = error.response?.data
      for (const key of ['method', 'baseURL', 'headers', 'url', 'data']) {
        this.config[key] = error.config?.[key]
      }
    }
    Error.captureStackTrace(this)
  }
}
