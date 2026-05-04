import { Path } from '../lib/path'
import { Writable, WriteStdout } from '../lib/writable'
import { collectApi, collectQueries, createQuerySchema } from './_generate'
import openApiJson from '../public/api/openapi.json' with { type: 'json' }

function formatRef(ref: string) {
  return ref.replace('#/components/', '').replace('/', '.')
}

function writeDocs(w: Writable, ident: string, docs: string[]) {
  if (docs.length > 0) {
    w.write(ident)
    w.write('/**\n')
    for (const line of docs) {
      w.write(ident)
      w.write(line)
    }
    w.write(ident)
    w.write(' */\n')
  }
}
function generateDocs(w: Writable, ident: string, item: any) {
  const docs: string[] = []
  if (item.description) {
    docs.push(` * ${item.description}\n`)
  }
  for (const key of ['default', 'format', 'example', 'minimum', 'maximum', 'minLength', 'maxLength']) {
    if (item[key] != null) {
      docs.push(` * @${key} ${item[key]}\n`)
    }
  }
  writeDocs(w, ident, docs)
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

function generateNumber(w: Writable, ident: string, item: any) {
  if (item.type !== 'number') throw new Error()

  if (item.enum && item.enum.length === 1) {
    const values: string[] = item.enum
    if (values.length > 10) {
      let count = 0
      w.write('//\n')
      for (const value of values) {
        w.write(ident)
        w.write(`  | ${value}`)
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
        w.write(`${value}`)
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
      if (item.additionalProperties) {
        w.write('Record<string, ')
        generateType(w, ident + '  ', item.additionalProperties)
        w.write('>')
      } else {
        const required: string[] = item.required || []
        w.write(`{\n`)
        for (const prop in item.properties) {
          const value = (item.properties as any)[prop]
          generateDocs(w, ident + '  ', value)
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
      }
    } else if (item.type === 'array') {
      if (item.items.$ref) {
        w.write(formatRef(item.items.$ref))
        w.write('[]')
      } else if (item.items.type === 'object') {
        w.write('Array<')
        generateType(w, ident, item.items)
        w.write('>')
      } else if (item.items.type) {
        w.write(item.items.type)
        w.write('[]')
      } else {
        w.write('any[]')
      }
    } else if (item.type === 'string') {
      generateString(w, ident, item)
    } else if (item.type === 'number') {
      generateNumber(w, ident, item)
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
    } else if (item.type === 'string') {
      w.write(`  export type ${name} = `)
      generateString(w, '  ', item)
    } else if (item.type === 'number') {
      w.write(`  export type ${name} = `)
      generateNumber(w, '  ', item)
    } else {
      w.write(`  export type ${name} = ${item.type}`)
    }
  } else if (item.$ref) {
    w.write(`  export type ${name} = ${formatRef(item.$ref)}`)
  } else if (item.allOf) {
    w.write(`  export type ${name} = `)
    let count = 0
    for (const subItem of item.allOf) {
      if (count > 0) {
        w.write(' & ')
      }
      generateType(w, '  ', subItem)
      count++
    }
  } else {
    w.write(`  export type ${name} = any`)
  }
}

function generateNamespace(w: Writable, component: keyof typeof openApiJson.components) {
  let count = 0
  w.write(`export namespace ${component} {\n`)
  for (const key in openApiJson.components[component]) {
    if (count > 0) {
      w.write('\n')
    }
    const item = (openApiJson.components[component] as any)[key]
    generateDocs(w, '  ', item)
    generateRootType(w, key, item)
    w.write('\n')
    count++
  }
  w.write('}\n')
}

function generateSwaggerTypesApi(w: Writable) {
  const api = collectApi()
  const queries = collectQueries()

  let count = 0
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

      {
        const docs: string[] = []
        if (endpoint.description) {
          docs.push(` * ${endpoint.description}\n`)
        }
        docs.push(` * @id ${endpoint.id}\n`)
        docs.push(` * @route ${endpoint.method.toUpperCase()} ${endpoint.url}\n`)
        if (endpoint.security && endpoint.security.length > 0) {
          docs.push(` * @security ${endpoint.security.map((it) => Object.keys(it)).join(', ')}\n`)
        }
        writeDocs(w, '    ', docs)
      }

      w.write(`    export namespace ${action} {\n`)

      if (endpoint.query) {
        const schema = createQuerySchema(queries, endpoint.query)
        w.write(`      export type query = `)
        generateType(w, '      ', schema)
        w.write('\n')
        w.write('\n')
      }

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
}

function generateSwaggerTypes(w: Writable) {
  generateNamespace(w, 'domain')
  w.write('\n')
  generateNamespace(w, 'schemas')
  w.write('\n')
  generateNamespace(w, 'errors')
  w.write('\n')
  generateNamespace(w, 'body')
  w.write('\n')

  {
    let count = 0
    w.write(`export namespace query {\n`)
    for (const key in openApiJson.components.query) {
      if (count > 0) {
        w.write('\n')
      }
      const item = (openApiJson.components.query as any)[key]
      generateDocs(w, '  ', item.schema)
      w.write(`  export type ${key} = `)
      generateType(w, '', item.schema)
      w.write('\n')
      count++
    }
    w.write('}\n')
    w.write('\n')
  }

  generateSwaggerTypesApi(w)
}

const DEBUG = false

if (DEBUG) {
  const w = new WriteStdout()
  generateSwaggerTypes(w)
} else {
  const swaggerTypesPath = Path.from(import.meta.dirname)
    .parent()
    .append('swagger-types.ts')
  const file = swaggerTypesPath.open('w')
  try {
    generateSwaggerTypes(file)
    console.log(`INFO: ${swaggerTypesPath} generated`)
  } finally {
    file.close()
  }
}
