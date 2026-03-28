import type { Router, NextFunction, Request, Response } from 'express'
import resolvers from './resolvers'

function createHandler(resolver: (req: Request, res: Response) => Promise<void>) {
  return async function handler(req: Request, res: Response, next: NextFunction) {
    try {
      await resolver(req, res)
    } catch (error) {
      next(error)
    }
  }
}

function getResolver(key: string) {
  const path = key.split('.')
  const maybeResolver: null | ((req: Request, res: Response) => Promise<void>) = path.reduce(
    (obj, key) => (obj && typeof obj === 'object' ? (obj as any)[key] : null),
    resolvers as any,
  )
  return maybeResolver
}

export default function plugOpenApiResolvers(router: Router, openApiJson: any) {
  const missing: string[] = []
  for (const path in openApiJson.paths) {
    const operations = openApiJson.paths[path]
    for (const method in operations) {
      const operation = operations[method]
      const expressPath = path.replace(/\{(\w+)\}/, ':$1')
      const resolver = getResolver(operation.operationId)
      if (!resolver) {
        missing.push(operation.operationId)
      } else {
        const handler = createHandler(resolver)
        router[method as 'get' | 'post' | 'put' | 'delete'](expressPath, handler)
      }
    }
  }
  if (missing.length > 0) {
    const groups: Record<string, string[]> = {}
    for (const key of missing) {
      const [a, b] = key.split('.')
      if (!groups[a]) groups[a] = []
      groups[a].push(b)
    }
    for (const a in groups) {
      const bs = groups[a]
      console.log(`${a}: {`)
      for (const b of bs) {
        console.log(`  async ${b}(req: Request, res: Response) {
    res.send('OK')
  },`)
      }
      console.log('},')
    }
    throw new Error('missing resolvers')
  }
}
