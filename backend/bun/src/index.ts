import Bun from 'bun'
import { Path } from './lib/path'

import { getAppConfig } from './core/config'
import { withCors } from './middlewares'
import { routes } from './routes'
import { BunRequestAdapter } from './adapter'
import { errors } from './core/errors'
import { replier } from './lib/http-adapter'

const publicDir = Path.from(import.meta.dirname).append('public')

const appConfig = getAppConfig()

Bun.serve({
  port: appConfig.port,
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

console.log(`🐎   App     ${appConfig.name}`)
console.log(`🔧   Env     ${appConfig.environemnt}`)
console.log(`🚀   Server  http://localhost:${appConfig.port}`)
console.log(`📚   API     http://localhost:${appConfig.port}/api`)
console.log(`📖   Docs    http://localhost:${appConfig.port}/api/docs`)
console.log(`📖   Redoc   http://localhost:${appConfig.port}/api/redoc`)
console.log(`🔐   Auth    http://localhost:${appConfig.port}/api/auth`)
