import openApiJson from '../public/api/openapi.json' with { type: 'json' }

export function collectApi() {
  type Action = {
    body: any | undefined
    query: { $ref: string }[] | undefined
    responses: Record<string, any>
  }
  const api: Record<string, { actions: Record<string, Action> }> = {}
  for (const pathUrl in openApiJson.paths) {
    const path = (openApiJson.paths as any)[pathUrl]
    openApiJson.paths['/api/appointments'].get.responses
    for (const method in path) {
      const endpoint = path[method]
      const [resource, action] = endpoint.operationId.split('.')
      if (!api[resource]) api[resource] = { actions: {} }
      if (!api[resource].actions[action])
        api[resource].actions[action] = { body: undefined, query: undefined, responses: {} }
      for (const status in endpoint.responses) {
        api[resource].actions[action].responses[status] = endpoint.responses[status]
      }
      if (endpoint.requestBody) {
        api[resource].actions[action].body = endpoint.requestBody
      }
      if (endpoint.parameters) {
        const query = endpoint.parameters.filter((it: any) => it.$ref?.startsWith('#/components/query/'))
        if (query.length > 0) {
          api[resource].actions[action].query = query
        }
      }
    }
  }
  return api
}

type Queries = Record<string, { key: string; type: string }>
export function collectQueries() {
  const queries: Queries = {}
  for (const name in openApiJson.components.query) {
    const query = (openApiJson.components.query as any)[name]
    const ref = '#/components/query/' + name
    queries[ref] = {
      key: query.name,
      type: 'query.' + name,
    }
  }
  return queries
}

export function createQuerySchema(queries: Queries, query: { $ref: string }[]) {
  const schema = {
    type: 'object',
    properties: {} as Record<string, any>,
  }
  for (const param of query) {
    const query = queries[param.$ref]
    schema.properties[query.key] = { $ref: param.$ref }
  }
  return schema
}
