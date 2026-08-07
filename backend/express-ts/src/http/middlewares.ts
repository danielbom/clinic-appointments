import type { Request, Response, NextFunction } from 'express'
import { logger } from '../core/logger'
import { ExpressRequestAdapter } from './adapter'

// morgan(':method :url :status :response-time ms - :res[content-length]')
export function logRequest(req: Request, res: Response, next: NextFunction) {
  const request = new ExpressRequestAdapter(req, res)
  const start = process.hrtime.bigint()
  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6
    const log = {
      method: req.method,
      url: req.originalUrl,
      status: req.statusCode ?? 0,
      durationMs: Math.round(durationMs * 1000) / 1000,
      traceId: request.getId(),
      operationId: request.getOperationId(),
    }
    const message = `${log.method} ${log.url} ${log.status} ${log.durationMs}ms`
    if (log.status >= 500) logger.error(log, message)
    else if (log.status >= 400) logger.warn(log, message)
    else logger.info(log, message)
  })
  next()
}
