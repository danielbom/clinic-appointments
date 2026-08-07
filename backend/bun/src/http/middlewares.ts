import { type BunRequest } from 'bun'
import { logger } from '../core/logger'
import { BunRequestAdapter } from './adapter'

// morgan ':method :url :status :response-time ms - :res[content-length]'
export function withLog(handler: (req: BunRequest) => Promise<Response>) {
  return async (req: BunRequest): Promise<Response> => {
    // Enter
    const start = process.hrtime.bigint()
    const request = new BunRequestAdapter(req)

    // Act
    const res = await handler(req)

    // Exit
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6
    const log = {
      method: req.method,
      url: req.url,
      status: res.status ?? 0,
      durationMs: Math.round(durationMs * 1000) / 1000,
      traceId: request.getId(),
      operationId: request.getOperationId(),
    }
    const message = `${log.method} ${log.url} ${log.status} ${log.durationMs}ms`
    if (log.status >= 500) logger.error(log, message)
    else if (log.status >= 400) logger.warn(log, message)
    else logger.info(log, message)

    return res
  }
}

// cors
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': [
    'Accept',
    'Origin',
    'Content-Type',
    'Authorization',
    'Access-Control-Expose-Headers',
    'Access-Control-Allow-Credentials',
    'X-Request-Id',
    'X-Operation-Id',
  ].join(','),
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
