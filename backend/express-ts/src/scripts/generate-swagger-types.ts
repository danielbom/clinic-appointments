import { Path } from '../lib/path'
import { Writable, WriteStdout } from '../lib/writable'
import openApiJson from '../public/api/openapi.json' with { type: 'json' }

function formatRef(ref: string) {
  return ref.replace('#/components/', '').replace('/', '.')
}

function generateString(w: Writable, ident: string, item: any) {
  if (item.type !== 'string') throw new Error()

  if (item.enum && item.enum.length > 0) {
    const values: string[] = item.enum
    if (values.length > 5) {
      let count = 0
      w.write('//\n')
      for (const value of values) {
        w.write(ident)
        w.write(`  | '${value}'`)
        if (count === 0) {
          w.write(' //')
        }
        if (count + 1 < values.length) {
          w.write('\n')
        }
        count++
      }
    } else {
      let count = 0
      for (const value of values) {
        if (count > 0) {
          w.write(' | ')
        }
        w.write(`'${value}'`)
        count++
      }
    }
  } else {
    w.write(item.type)
  }
}

function generateType(w: Writable, ident: string, item: any) {
  if (item.$ref) {
    w.write(formatRef(item.$ref))
  } else if (item.type) {
    if (item.type === 'object') {
      const required: string[] = item.required || []
      w.write(`{\n`)
      for (const prop in item.properties) {
        const value = (item.properties as any)[prop]
        w.write(ident)
        w.write(`  ${prop}`)
        if (required.includes(prop)) {
          w.write(`: `)
        } else {
          w.write(`?: `)
        }
        generateType(w, ident + '  ', value)
        w.write('\n')
      }
      w.write(ident)
      w.write('}')
    } else if (item.type === 'array') {
      if (item.items.$ref) {
        w.write(formatRef(item.items.$ref))
        w.write('[]')
      } else if (item.items.type === 'object') {
        w.write('Array<')
        generateType(w, ident, item.items)
        w.write('>')
      } else {
        w.write('any[]')
      }
    } else if (item.type === 'string') {
      generateString(w, ident, item)
    } else {
      w.write(item.type)
    }
  } else {
    w.write('any')
  }
}

function generateRootType(w: Writable, name: string, item: any) {
  if (item.type) {
    if (item.type === 'array') {
      w.write(`  export type ${name} = `)
      generateType(w, '  ', item.items)
    } else if (item.type === 'object') {
      w.write(`  export interface ${name} `)
      generateType(w, '  ', item)
    } else {
      w.write(`  export type ${name} = ${item.type}`)
    }
  } else if (item.$ref) {
    w.write(`  export type ${name} = ${formatRef(item.$ref)}`)
  } else {
    w.write(`  export type ${name} = any`)
  }
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

function generateSwaggerTypes(w: Writable) {
  let count = 0
  w.write('export namespace domain {\n')
  for (const key in openApiJson.components.domain) {
    if (count > 0) {
      w.write('\n')
    }
    const item = (openApiJson.components.domain as any)[key]
    const docs: string[] = []
    if (item.description) {
      docs.push(`   * @description: ${item.description}\n`)
    }
    if (item.format) {
      docs.push(`   * @format: ${item.format}\n`)
    }
    if (docs.length > 0) {
      w.write('  /**\n')
      for (const line of docs) {
        w.write(line)
      }
      w.write('   */\n')
    }
    w.write(`  export type ${key} = ${item.type}\n`)
    count++
  }
  w.write('}\n')
  w.write('\n')
  count = 0
  w.write('export namespace errors {\n')
  for (const key in openApiJson.components.errors) {
    if (count > 0) {
      w.write('\n')
    }
    const item = (openApiJson.components.errors as any)[key]
    generateRootType(w, key, item)
    w.write('\n')
    count++
  }
  w.write('}\n')
  w.write('\n')
  count = 0
  w.write('export namespace schemas {\n')
  for (const key in openApiJson.components.schemas) {
    if (count > 0) {
      w.write('\n')
    }
    const item = (openApiJson.components.schemas as any)[key]
    generateRootType(w, key, item)
    w.write('\n')
    count++
  }
  w.write('}\n')
  w.write('\n')
  count = 0
  w.write('export namespace body {\n')
  for (const key in openApiJson.components.body) {
    if (count > 0) {
      w.write('\n')
    }
    const item = (openApiJson.components.body as any)[key]
    generateRootType(w, key, item)
    w.write('\n')
    count++
  }
  w.write('}\n')
  w.write('\n')

  const api = collectApi()

  count = 0
  w.write('export namespace api {\n')
  for (const resource in api) {
    const route = api[resource]

    if (count > 0) {
      w.write('\n')
    }

    let countResource = 0
    w.write(`  export namespace ${resource} {\n`)
    for (const action in route.actions) {
      const endpoint = route.actions[action]
      if (countResource > 0) {
        w.write('\n')
      }

      w.write(`    export namespace ${action} {\n`)

      if (endpoint.body) {
        const schema = endpoint.body?.content?.['application/json']?.schema
        if (schema) {
          w.write(`      export type body = `)
          generateType(w, '        ', schema)
          w.write('\n')
        } else {
          w.write(`      export type body = any\n`)
        }
        w.write('\n')
      }

      w.write(`      export type responses = {\n`)
      for (const status in endpoint.responses) {
        const response = endpoint.responses[status]
        const schema = response?.content?.['application/json']?.schema
        if (response.description) {
          w.write('        /**\n')
          w.write('         * ' + response.description + '\n')
          w.write('         */\n')
        }
        if (schema) {
          w.write(`        ${status}: `)
          generateType(w, '        ', schema)
          w.write('\n')
        } else {
          w.write(`        ${status}: any\n`)
        }
      }
      w.write('      }\n')
      w.write('    }\n')
      countResource++
    }
    w.write('  }\n')
    count++
  }
  w.write('}\n')
  w.write('\n')
}

const DEBUG = false

if (DEBUG) {
  const w = new WriteStdout()
  generateSwaggerTypes(w)
} else {
  const path = Path.from(import.meta.dirname)
    .parent()
    .append('swagger-types.ts')
  const file = path.open('w')
  try {
    generateSwaggerTypes(file)
  } finally {
    file.close()
  }
}
