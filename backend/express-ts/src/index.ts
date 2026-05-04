import 'dotenv/config'
import openApiJson from './public/api/openapi.json' with { type: 'json' }
import swaggerUI from 'swagger-ui-express'
import express, { NextFunction, Request, Response, Router } from 'express'
import crypto from 'node:crypto'
import path from 'node:path'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import plugOpenApiResolvers from './plug-resolvers'
import { getAppConfig } from './config'
import { context } from './context'
import { errors } from './errors'

const appConfig = getAppConfig()
const app = express()

app.use((req, res, next) => {
  const id = req.header('x-request-id') || crypto.randomUUID()
  context.set(req, 'id', id)
  res.setHeader('X-Request-Id', id)
  next()
})

// Security middleware
app.use(helmet())
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }),
)

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1)
app.use(morgan(':method :url :status :response-time ms - :res[content-length]'))

{
  const api = Router()
  api.use('/api', express.static(path.join(import.meta.dirname, 'public/api')))
  api.use('/api/docs', swaggerUI.serve, swaggerUI.setup(openApiJson))
  api.use('/api/schemas', express.static(path.join(import.meta.dirname, 'public/schemas')))
  api.use('/api/redoc', express.static(path.join(import.meta.dirname, 'public/redoc')))
  api.use(express.json({ type: 'application/json' }))
  plugOpenApiResolvers(api, openApiJson)
  app.use(api)
}

// not found
app.use('/', (req, res, next) => {
  res.status(404).json(errors.routeNotFound(req.method, req.url))
  next()
})

// handle unexpected errors
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err)
  res.status(500).json(errors.internal('An unexpected error occured'))
})

app.listen(appConfig.port, () => {
  console.log(`🐎   App     ${appConfig.name}`)
  console.log(`🔧   Env     ${appConfig.environemnt}`)
  console.log(`🚀   Server  http://localhost:${appConfig.port}`)
  console.log(`📚   API     http://localhost:${appConfig.port}/api`)
  console.log(`📖   Docs    http://localhost:${appConfig.port}/api/docs`)
  console.log(`📖   Redoc   http://localhost:${appConfig.port}/api/redoc`)
  console.log(`🔐   Auth    http://localhost:${appConfig.port}/api/auth`)
})
