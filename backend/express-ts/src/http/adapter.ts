import type { Request, Response } from 'express'

import type { RequestAdapter, ResponseAdapter } from '../lib/http-adapter'
import { requestLogger } from '../core/logger'

type State = {
  id: string
  operationId: string
}

export class ExpressRequestAdapter implements RequestAdapter<State> {
  private url: URL
  private state: Partial<State> = {}
  private headers: Record<string, string> = {}

  constructor(
    private req: Request,
    private res: Response,
  ) {
    this.url = new URL(`http://${process.env.HOST ?? 'localhost'}${req.url}`)
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
    return this.req.header(key) ?? null
  }

  setHeader(key: string, value: string) {
    this.headers[key.toLowerCase()] = value
  }

  getPathParam(key: string): string | null {
    const param = this.req.params[key]
    if (Array.isArray(param)) return param[0] || null
    return param ?? null
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

  async getJsonBody(): Promise<{} | null> {
    return this.req.body ?? null
  }

  getFromContext<K extends keyof State>(key: K) {
    return this.state[key] ?? null
  }

  setToContext<K extends keyof State>(key: K, value: State[K]) {
    this.state[key] = value
  }

  send(response: ResponseAdapter): any {
    for (const header in this.headers) {
      this.res.setHeader(header, this.headers[header]!)
    }
    return this.res.status(response.status).json(response.json)
  }
}
