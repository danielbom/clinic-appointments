import Bun from 'bun'
import { Path } from '../lib/path'

import { getAppConfig } from '../core/config'
import { withCors } from './middlewares'
import { routes } from './routes'
import { BunRequestAdapter } from './adapter'
import { errors } from './errors/presenter'
import { replier } from '../lib/http-adapter'
import { logger } from '../core/logger'

export function startWebServer() {
  const publicDir = Path.from(import.meta.dirname).append('public')

  const app = getAppConfig()

  Bun.serve({
    port: app.port,
    routes: {
      ...routes,
      '/api/openapi.json': withCors(async () => new Response(Bun.file(publicDir.append('api/openapi.json').value()))),
      '/api/redoc': async () => Response.redirect('/api/redoc/index.html'),
      '/api/redoc/': async () => Response.redirect('/api/redoc/index.html'),
      '/api/redoc/*': withCors(async (req) => {
        const file = Bun.file(publicDir.append(new URL(req.url).pathname.slice('/api'.length)).value())
        if (await file.exists()) return new Response(file)
        return new Response('Not Found', { status: 404 })
      }),
      '/*': async (req) => {
        const request = new BunRequestAdapter(req)
        const reply = replier(request)
        return request.send(reply.fail(errors.routeNotFound(req.method, request.getUrl())))
      },
    },
  })

  logger.info(`App     ${app.name}`)
  logger.info(`Env     ${app.environment}`)
  logger.info(`Server  http://localhost:${app.port}`)
  logger.info(`API     http://localhost:${app.port}/api`)
  logger.info(`Docs    http://localhost:${app.port}/api/docs`)
  logger.info(`Redoc   http://localhost:${app.port}/api/redoc`)
  logger.info(`Auth    http://localhost:${app.port}/api/auth`)
  logger.info(`Health  http://localhost:${app.port}/api/health/check`)
}
