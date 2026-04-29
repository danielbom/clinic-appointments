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

const appConfig = getAppConfig()
const app = express()

app.use((req, res, next) => {
  const id = req.header('x-request-id') || crypto.randomUUID()
  ;(req as any).id = id
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
  api.use(express.json({ type: 'application/json' }))
  api.use('/api', express.static(path.join(import.meta.dirname, 'public/api')))
  plugOpenApiResolvers(api, openApiJson)
  api.use('/api/docs', swaggerUI.serve, swaggerUI.setup(openApiJson))
  api.use('/api/redoc', express.static(path.join(import.meta.dirname, 'public/redoc')))
  app.use(api)
}

// not found
app.use('/', (req, res, next) => {
  res.status(404).json({ error: `route ${req.method} ${req.url} not found`, method: req.method, url: req.url })
  next()
})

// handle jwt errors
app.use((err: Error, _req: Request, res: Response, next: NextFunction) => {
  if (err && typeof err === 'object') {
    if (err.name === 'UnauthorizedError') {
      return res.status(401).json({ error: err.message })
    }
  }
  next(err)
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
