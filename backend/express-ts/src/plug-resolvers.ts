import type { Router } from 'express'
import { expressResolversAdapter } from './adapter'

export default function plugOpenApiResolvers(router: Router, openApiJson: any) {
  const missing: string[] = []
  for (const path in openApiJson.paths) {
    const operations = openApiJson.paths[path]
    for (const method in operations) {
      const operation = operations[method]
      const expressPath = path.replaceAll(/\{(\w+)\}/g, ':$1')
      const resolver = expressResolversAdapter(operation.operationId)
      if (!resolver) {
        missing.push(operation.operationId)
      } else {
        router[method as 'get' | 'post' | 'put' | 'delete'](expressPath, resolver)
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
