import { withMiddlewares } from './middlewares'
import { replier, type Resolver } from '../lib/http-adapter'
import { errors } from './errors/presenter'
import { BunRequestAdapter } from './adapter'
import resolvers from './resolvers'

for (const resource in resolvers) {
  const actions = (resolvers as any)[resource]
  for (const actionName in actions) {
    actions[actionName].operationId = `${resource}.${actionName}`
  }
}

function getResolver(key: string) {
  const path = key.split('.')
  const maybeResolver: null | Resolver = path.reduce(
    (obj, key) => (obj && typeof obj === 'object' ? (obj as any)[key] : null),
    resolvers as any,
  )
  return maybeResolver
}

function wrapResolver(operationId: string, resolver: Resolver | null) {
  return withMiddlewares(async (req) => {
    const requestId = crypto.randomUUID()
    const request = new BunRequestAdapter(req)
    const reply = replier(request)
    request.setToContext('operationId', operationId)
    request.setHeader('x-operation-id', operationId)
    request.setToContext('id', requestId)
    request.setHeader('x-request-id', requestId)
    const logger = request.getLogger()

    if (!resolver) {
      const response = reply.fail(errors.internal(`Resolver for ${operationId} not implemented`))
      return request.send(response)
    }
    try {
      const response = await resolver(request)
      if (response.json !== undefined) {
        return request.send(response)
      }
      return request.send(reply.fail(errors.internal(`Adapter for ${operationId} return type not implemented`)))
    } catch (err) {
      logger.error({ err }, 'unhandled error')
      return request.send(reply.fail(errors.internal('An unexpected error occured')))
    }
  })
}

export function bindResolver(resolver: Resolver) {
  return wrapResolver((resolver as any).operationId, resolver)
}

export function bunResolversAdapter(operationId: string) {
  return wrapResolver(operationId, getResolver(operationId))
}
