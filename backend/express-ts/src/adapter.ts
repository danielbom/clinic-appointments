import type { Request, Response } from 'express'

import { replier } from './lib/http-adapter'
import type { RequestAdapter, Resolver, ResponseAdapter } from './lib/http-adapter'
import resolvers from './core/resolvers'
import { errors } from './core/errors'

type State = {
  id: string
  operationId: string
}

function getResolver(key: string) {
  const path = key.split('.')
  const maybeResolver: null | Resolver = path.reduce(
    (obj, key) => (obj && typeof obj === 'object' ? (obj as any)[key] : null),
    resolvers as any,
  )
  return maybeResolver
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
    this.plugId()
  }

  private plugId() {
    const id = this.getHeader('x-request-id') || crypto.randomUUID()
    this.setToContext('id', id)
    this.setHeader('x-request-id', id)
  }

  getId(): string {
    return this.getFromContext('id')!
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

export function expressResolversAdapter(operationId: string) {
  const resolver = getResolver(operationId)
  return async (req: Request, res: Response) => {
    const request = new ExpressRequestAdapter(req, res)
    request.setToContext('operationId', operationId)
    request.setHeader('x-operation-id', operationId)
    if (!resolver) {
      const reply = replier(request)
      const response = reply.fail(errors.internal(`Resolver for ${operationId} not implemented`))
      return request.send(response)
    }
    try {
      const response = await resolver(request)
      if (response.json !== undefined) {
        return request.send(response)
      }
      {
        const reply = replier(request)
        return request.send(reply.fail(errors.internal(`Adapter for ${operationId} return type not implemented`)))
      }
    } catch (error) {
      console.error(error)
      const reply = replier(request)
      return request.send(reply.fail(errors.internal(`An unexpected error occured`)))
    }
  }
}
