import { type BunRequest } from 'bun'

import { withMiddlewares } from './middlewares'
import resolvers from './core/resolvers'

import { replier, type RequestAdapter, type Resolver, type ResponseAdapter } from './lib/http-adapter'
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

export class BunRequestAdapter implements RequestAdapter {
  private url: URL
  private state: any = {}
  private headers: Record<string, string> = {}

  constructor(private req: BunRequest) {
    this.url = new URL(req.url)
    this.plugId()
  }

  private plugId() {
    const id = this.getHeader('x-request-id') || crypto.randomUUID()
    this.setToContext('id', id)
    this.setHeader('X-Request-Id', id)
  }

  getId() {
    return this.getFromContext('id')
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
    return this.url.searchParams.entries().reduce(
      (dict, [key, value]) => {
        dict[key] = value
        return dict
      },
      {} as Record<string, string | undefined>,
    )
  }

  async getJsonBody(): Promise<{} | null> {
    return (await this.req.body?.json()) ?? null
  }

  getFromContext<K extends keyof State>(key: K) {
    return this.state[key] ?? null
  }

  setToContext<K extends keyof State>(key: K, value: State[K]) {
    this.state[key] = value
  }

  send(response: ResponseAdapter): any {
    if (response.status === 204) {
      return new Response('', { status: response.status })
    }
    return Response.json(response.json, { status: response.status, headers: this.headers })
  }
}

export function bunResolversAdapter(operationId: string) {
  const resolver = getResolver(operationId)
  return withMiddlewares(async (req) => {
    const request = new BunRequestAdapter(req)
    request.setToContext('operationId', operationId)
    request.setHeader('operation-id', operationId)
    if (!resolver) {
      const reply = replier(request)
      return request.send(reply.fail(errors.internal(`Resolver for ${operationId} not implemented`)))
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
      return request.send(reply.fail(errors.internal('An unexpected error occured')))
    }
  })
}
