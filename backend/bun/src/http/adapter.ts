import type { BunRequest } from 'bun'
import { requestLogger } from '../core/logger'
import type { RequestAdapter, ResponseAdapter } from '../lib/http-adapter'
import { withMiddlewares } from './middlewares'

type State = {
  id: string
  operationId: string
}

export class BunRequestAdapter implements RequestAdapter<State> {
  private url: URL
  private state: Partial<State> = {}
  private headers: Record<string, string> = {}

  constructor(private req: BunRequest) {
    this.url = new URL(req.url)
    const state = (this.req as any)._state || {}
    this.state = (this.req as any)._state = state
  }

  getId(): string {
    return this.getFromContext('id') || crypto.randomUUID()
  }

  getOperationId(): string | null {
    return this.getFromContext('operationId')
  }

  getLogger() {
    return requestLogger(this.getId(), this.getOperationId() ?? undefined)
  }

  getUrl(): URL {
    return this.url
  }

  getHeader(key: string): string | null {
    return this.req.headers.get(key) ?? this.req.headers.get(key.toLowerCase())
  }

  setHeader(key: string, value: string) {
    this.headers[key.toLowerCase()] = value
  }

  getPathParam(key: string): string | null {
    return this.req.params[key] ?? null
  }

  getQueryParam(key: string): string | null {
    return this.url.searchParams.get(key)
  }

  getQueryParams(): Record<string, string | undefined> {
    return Array.from(this.url.searchParams.entries()).reduce(
      (dict, [key, value]) => {
        dict[key] = value
        return dict
      },
      {} as Record<string, string | undefined>,
    )
  }

  async getRawBody(): Promise<unknown | null> {
    if (!this.req.body) return null
    return (await this.req.text()) ?? null
  }

  async getJsonBody(): Promise<object | null> {
    if (!this.req.body) return null
    return (await this.req.json()) ?? null
  }

  getFromContext<K extends keyof State>(key: K) {
    return this.state[key] ?? null
  }

  setToContext<K extends keyof State>(key: K, value: State[K]) {
    this.state[key] = value
  }

  send(response: ResponseAdapter): any {
    if (response.status === 204) {
      return new Response('', { status: response.status, headers: this.headers })
    }
    return Response.json(response.json, { status: response.status, headers: this.headers })
  }
}

export function withAdapter(executeRequest: (req: BunRequestAdapter) => Response | Promise<Response>) {
  return withMiddlewares(async (req: BunRequest) => executeRequest(new BunRequestAdapter(req)))
}
