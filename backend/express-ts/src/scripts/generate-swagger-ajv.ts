import { Path } from '../lib/path'
import { Writable } from '../lib/writable'
import openApiJson from '../public/api/openapi.json' with { type: 'json' }

function getId(baseUrl: string, name: string) {
  return `${baseUrl}/schemas/${name.replace('#/components/', '')}.json`
}

function mapSchema(baseUrl: string, schema: any) {
  if (schema.$id) {
    schema.$id = getId(baseUrl, schema.$id)
  }
  if (schema.$ref) {
    schema.$ref = getId(baseUrl, schema.$ref)
  }
  if (schema.type === 'object') {
    schema.properties = { ...schema.properties }
    for (const key in schema.properties) {
      schema.properties[key] = mapSchema(baseUrl, schema.properties[key])
    }
  }
  if (schema.type === 'array') {
    schema.items = mapSchema(baseUrl, { ...schema.items })
  }
  return schema
}

function generateSchemas(schemasDir: Path, baseUrl: string, component: keyof typeof openApiJson.components) {
  for (const key in (openApiJson.components as any)[component]) {
    const id = `${component}/${key}`
    const filePath = schemasDir.append(id + '.json')
    filePath.parent().mkdir({ existsOk: true, parents: true })
    const schema = mapSchema(baseUrl, {
      $id: id,
      ...(openApiJson.components as any)[component][key],
    })
    filePath.writeText(JSON.stringify(schema, null, 2))
  }
}

function generateAllSchemas(schemasDir: Path, { baseUrl }: { baseUrl: string }) {
  schemasDir.mkdir({ existsOk: true })
  generateSchemas(schemasDir, baseUrl, 'domain')
  generateSchemas(schemasDir, baseUrl, 'body')
  generateSchemas(schemasDir, baseUrl, 'errors')
  generateSchemas(schemasDir, baseUrl, 'schemas')
}

function collectApi() {
  const api: Record<string, { actions: Record<string, { body: any | undefined; responses: Record<string, any> }> }> = {}
  for (const pathUrl in openApiJson.paths) {
    const path = (openApiJson.paths as any)[pathUrl]
    openApiJson.paths['/api/appointments'].get.responses
    for (const method in path) {
      const endpoint = path[method]
      const [resource, action] = endpoint.operationId.split('.')
      if (!api[resource]) api[resource] = { actions: {} }
      if (!api[resource].actions[action]) api[resource].actions[action] = { body: undefined, responses: {} }
      for (const status in endpoint.responses) {
        api[resource].actions[action].responses[status] = endpoint.responses[status]
      }
      if (endpoint.requestBody) {
        api[resource].actions[action].body = endpoint.requestBody
      }
    }
  }
  return api
}

function hasBody(actions: Record<string, { body: any | undefined }>): boolean {
  for (const key in actions) {
    if (actions[key].body) return true
  }
  return false
}

function generateAjvValidations(w: Writable, { baseUrl }: { baseUrl: string }) {
  const api = collectApi()

  w.write("import { ajv } from './ajv'\n")
  w.write("import * as types from './swagger-types'\n")

  w.write('\n')
  w.write('export const validations = {\n')
  for (const resource in api) {
    const route = api[resource]
    if (!hasBody(route.actions)) continue

    w.write(`  ${resource}: {\n`)
    for (const action in route.actions) {
      const endpoint = route.actions[action]
      if (!endpoint.body) continue

      w.write(`    ${action}: {\n`)
      if (endpoint.body) {
        const id = getId(baseUrl, endpoint.body.content['application/json'].schema.$ref)
        const name = id.slice(id.lastIndexOf('/') + 1, id.lastIndexOf('.'))
        w.write(`      body: ajv.compile<types.body.${name}>({\n`)
        w.write(`        $ref: '${id}',\n`)
        w.write(`      }),\n`)
      }
      if (false /** disabled */) {
        const response = endpoint.responses[200]
        const schema = response?.content['application/json'].schema
        if (schema) {
          if (schema.$ref) {
            const id = getId(baseUrl, schema.$ref)
            const name = id.slice(id.lastIndexOf('/') + 1, id.lastIndexOf('.'))
            w.write(`      response: ajv.compile<types.schemas.${name}>({\n`)
            w.write(`        $ref: '${id}',\n`)
            w.write(`      }),\n`)
          }
          if (schema.type === 'array') {
            const id = getId(baseUrl, schema.items.$ref)
            const name = id.slice(id.lastIndexOf('/') + 1, id.lastIndexOf('.'))
            w.write(`      response: ajv.compile<types.schemas.${name}[]>({\n`)
            w.write(`        type: 'array',\n`)
            w.write(`        items: { $ref: '${id}' },\n`)
            w.write(`      }),\n`)
          }
        }
      }
      w.write('    },\n')
    }
    w.write('  },\n')
  }
  w.write('}\n')
}

{
  const baseUrl = 'https://dev-clinic-appointments.com.br'

  const schemasDir = Path.from(import.meta.dirname)
    .parent()
    .append('public/schemas')
  generateAllSchemas(schemasDir, { baseUrl })
  console.log(`INFO: ${schemasDir} generated`)

  const validationsPath = Path.from(import.meta.dirname)
    .parent()
    .append('validations.ts')
  const file = validationsPath.open('w')
  try {
    generateAjvValidations(file, { baseUrl })
    console.log(`INFO: ${validationsPath} generated`)
  } finally {
    file.close()
  }
}
