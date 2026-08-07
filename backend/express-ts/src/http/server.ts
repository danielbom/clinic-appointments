import 'dotenv/config'
import openApiJson from '../public/api/openapi.json' with { type: 'json' }
import swaggerUI from 'swagger-ui-express'
import express, { Router } from 'express'
import type { NextFunction, Request, Response } from 'express'
import path from 'node:path'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { getAppConfig } from '../core/config'
import { errors } from './errors/presenter'
import { replier } from '../lib/http-adapter'
import { routes } from './routes'
import { ExpressRequestAdapter } from './adapter'

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

  server.use(morgan(':method :url :status :response-time ms - :res[content-length]'))

  {
    const api = Router()
    api.use('/api', express.static(path.join(import.meta.dirname, 'public/api')))
    api.use('/api/docs', swaggerUI.serve, swaggerUI.setup(openApiJson))
    api.use('/api/schemas', express.static(path.join(import.meta.dirname, 'public/schemas')))
    api.use('/api/redoc', express.static(path.join(import.meta.dirname, 'public/redoc')))
    api.use(express.json({ type: 'application/json' }))
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
    console.error(err)
    const request = new ExpressRequestAdapter(req, res)
    const reply = replier(request)
    return request.send(reply.fail(errors.internal('An unexpected error occured')))
  })

  return server
}

export function startWebServer() {
  const app = getAppConfig()
  const server = createServer()

  server.listen(app.port, () => {
    console.log(`🐎   App     ${app.name}`)
    console.log(`🔧   Env     ${app.environment}`)
    console.log(`🚀   Server  http://localhost:${app.port}`)
    console.log(`📚   API     http://localhost:${app.port}/api`)
    console.log(`📖   Docs    http://localhost:${app.port}/api/docs`)
    console.log(`📖   Redoc   http://localhost:${app.port}/api/redoc`)
    console.log(`🔐   Auth    http://localhost:${app.port}/api/auth`)
  })
}
