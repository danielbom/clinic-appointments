import 'dotenv/config'
import openApiJson from './public/api/openapi.json' with { type: 'json' }
import swaggerUI from 'swagger-ui-express'
import express, { NextFunction, Request, Response, Router } from 'express'
import path from 'node:path'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { getAppConfig } from './core/config'
import { errors } from './core/errors'
import { replier } from './lib/http-adapter'
import { routes } from './routes'
import { ExpressRequestAdapter } from './adapter'

const appConfig = getAppConfig()
const app = express()

// Security middleware
app.use(helmet())
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
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
  api.use(routes)
  app.use(api)
}

// not found
app.use('/', (req, res, _next) => {
  const request = new ExpressRequestAdapter(req, res)
  const reply = replier(request)
  return request.send(reply.fail(errors.routeNotFound(req.method, request.getUrl())))
})

// handle unexpected errors
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error(err)
  const request = new ExpressRequestAdapter(req, res)
  const reply = replier(request)
  return request.send(reply.fail(errors.internal('An unexpected error occured')))
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
