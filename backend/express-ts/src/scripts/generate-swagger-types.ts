import { Path } from '../lib/path'
import { Writable, WriteStdout } from '../lib/writable'
import openApiJson from '../public/api/openapi.json' with { type: 'json' }

function formatRef(ref: string) {
  return ref.replace('#/components/', '').replace('/', '.')
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
        generateType(w, ident + '  ', item.items)
        w.write('>')
      } else {
        w.write('any[]')
      }
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
