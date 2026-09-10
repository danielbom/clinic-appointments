import 'dotenv/config'
import openApiJson from '../public/api/openapi.json' with { type: 'json' }
import swaggerUI from 'swagger-ui-express'
import express, { Router } from 'express'
import type { NextFunction, Request, Response } from 'express'
import path from 'node:path'
import cors from 'cors'
import helmet from 'helmet'
import { getAppConfig } from '../core/config'
import { errors } from './errors/presenter'
import { replier } from '../lib/http-adapter'
import { routes } from './routes'
import { ExpressRequestAdapter } from './adapter'
import { logger } from '../core/logger'
import { logRequest } from './middlewares'

export function createServer() {
  const server = express()

  // Security middleware
  server.use(helmet())
  server.use(
    cors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      credentials: true,
    }),
  )
  server.set('trust proxy', 1)

  server.use(logRequest)

  {
    const api = Router()
    api.use('/api', express.static(path.join(import.meta.dirname, '../public/api')))
    api.use('/api/docs', swaggerUI.serve, swaggerUI.setup(openApiJson))
    api.use('/api/schemas', express.static(path.join(import.meta.dirname, '../public/schemas')))
    api.use('/api/redoc', express.static(path.join(import.meta.dirname, '../public/redoc')))
    api.use(
      express.json({
        type: 'application/json',
        verify: (req, _res, buf) => {
          if (req.url && req.url.includes('/webhooks/')) {
            ;(req as any).rawBody = buf.toString('utf8')
          }
        },
      }),
    )
    api.use(routes)
    server.use(api)
  }

  // not found
  server.use('/', (req, res, _next) => {
    const request = new ExpressRequestAdapter(req, res)
    const reply = replier(request)
    return request.send(reply.fail(errors.routeNotFound(req.method, request.getUrl())))
  })

  // handle unexpected errors
  server.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
    const request = new ExpressRequestAdapter(req, res)
    const reply = replier(request)
    request.getLogger().error({ err }, 'unhandled error')
    return request.send(reply.fail(errors.internal('An unexpected error occured')))
  })

  return server
}

export function startWebServer() {
  const app = getAppConfig()
  const server = createServer()

  server.listen(app.port, () => {
    logger.info(`App     ${app.name}`)
    logger.info(`Env     ${app.environment}`)
    logger.info(`Server  http://localhost:${app.port}`)
    logger.info(`API     http://localhost:${app.port}/api`)
    logger.info(`Docs    http://localhost:${app.port}/api/docs`)
    logger.info(`Redoc   http://localhost:${app.port}/api/redoc`)
    logger.info(`Auth    http://localhost:${app.port}/api/auth`)
    logger.info(`Health  http://localhost:${app.port}/api/health/check`)
  })
}
