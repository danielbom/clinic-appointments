import type { Request, Response } from 'express'
import { replier, type Resolver } from '../lib/http-adapter'
import { ExpressRequestAdapter } from './adapter'
import { errors } from './errors/presenter'
import resolvers from './resolvers'

for (const resource in resolvers) {
  const actions = (resolvers as any)[resource]
  for (const actionName in actions) {
    actions[actionName].operationId = `${resource}.${actionName}`
  }
}

export function wrapResolver(operationId: string, resolver: Resolver) {
  return async (req: Request, res: Response) => {
    const requestId = crypto.randomUUID()
    const request = new ExpressRequestAdapter(req, res)
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
      return request.send(reply.fail(errors.internal(`An unexpected error occured`)))
    }
  }
}

export function bindResolver(resolver: Resolver) {
  return wrapResolver((resolver as any).operationId, resolver)
}
