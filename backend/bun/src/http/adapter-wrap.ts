import { generateId } from '../core/id'
import { type Resolver, replier } from '../lib/http-adapter'
import { withAdapter } from './adapter'
import { errors } from './errors/presenter'
import resolvers from './resolvers'

for (const resource in resolvers) {
  const actions = (resolvers as any)[resource]
  for (const actionName in actions) {
    actions[actionName].operationId = `${resource}.${actionName}`
  }
}

function wrapResolver(operationId: string, resolver: Resolver) {
  return withAdapter(async (request) => {
    const requestId = request.getHeader('x-request-id') ?? generateId()
    const reply = replier(request)
    request.setToContext('operationId', operationId)
    request.setHeader('x-operation-id', operationId)
    request.setToContext('id', requestId)
    request.setHeader('x-request-id', requestId)
    const logger = request.getLogger()

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
