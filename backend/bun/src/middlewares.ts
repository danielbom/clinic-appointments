import { type BunRequest } from 'bun'

// morgan ':method :url :status :response-time ms - :res[content-length]'
export function withLog(handler: (req: BunRequest) => Promise<Response>) {
  return async (req: BunRequest): Promise<Response> => {
    // Enter
    const startedAt = Date.now()

    // Act
    const res = await handler(req)

    // Exit
    const url = new URL(req.url)
    const responseTime = Date.now() - startedAt
    const contentLength = res.headers.get('content-length') ?? res.headers.get('Content-Length') ?? '-'
    const id = res.headers.get('operation-id') ?? '-'
    const time = new Date().toISOString()
    console.log(`[${time}] ${req.method} ${url.pathname} (${id}) ${res.status} ${responseTime} ms - ${contentLength}`)
    return res
  }
}

// cors
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export function withCors(handler: (req: BunRequest) => Response | Promise<Response>) {
  return async (req: BunRequest) => {
    // Enter
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      })
    }

    // Act
    const res = await handler(req)

    // Exit
    // Append CORS headers to response
    for (const [key, value] of Object.entries(corsHeaders)) {
      res.headers.set(key, value)
    }
    return res
  }
}

export function withMiddlewares(handler: (req: BunRequest) => Response | Promise<Response>) {
  return withLog(withCors(async (req: BunRequest) => await handler(req)))
}
