export interface RequestAdapter<State = {}> {
  getId(): string
  getUrl(): URL
  getHeader(key: string): string | null
  getPathParam(key: string): string | null
  getQueryParam(key: string): string | null
  getQueryParams(): Record<string, string | undefined>
  getJsonBody(): Promise<{} | null>
  getFromContext<K extends keyof State>(key: K): State[K] | null
  setToContext<K extends keyof State>(key: K, value: State[K]): void
}

export interface ResponseAdapter {
  status: number
  json?: any
}

export type Resolver = (req: RequestAdapter) => Promise<ResponseAdapter>

export function replier<R extends Record<number, unknown>>(req: RequestAdapter) {
  type Status = keyof R & number
  return {
    send<K extends Status>(key: K, value: R[K]): ResponseAdapter {
      return {
        status: key,
        json: value,
      }
    },
    fail<T extends { status: Status }>(value: T) {
      const url = req.getUrl()
      const fullUrl = url.toString()
      const result = {
        ...value,
        instance: fullUrl.slice(fullUrl.indexOf(url.host) + url.host.length),
        traceId: req.getId(),
      }
      // TODO: console.error(result)
      return this.send(value.status, result)
    },
  }
}
