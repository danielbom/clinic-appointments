import {
  BUNDLE_PATH,
  COMPONENT_GROUPS,
  PUBLIC_SCHEMAS_DIR,
  SPEC_BASE,
  SPEC_PATHS_DIR,
  SPEC_SCHEMAS_DIR,
} from './_config'
import { getSchemaId, refToSchemaId } from './_internal'

function readSchemaFiles(bucket: string) {
  const result: Record<string, any> = {}
  const dir = SPEC_SCHEMAS_DIR.append(bucket)
  if (dir.exists()) {
    for (const file of dir.listDir()) {
      if (file.suffix() === '.json') {
        result[file.stem()] = JSON.parse(file.readText())
      }
    }
  }
  return result
}

export function prettyJsonStringify(root: any) {
  const NOWRAP_SIZE = 160

  function go(json: any, ident = 0): string[] {
    switch (typeof json) {
      case 'boolean':
        return [json ? 'true' : 'false']
      case 'number':
        return [String(json)]
      case 'string':
        return [JSON.stringify(json)]
      case 'object': {
        if (json === null) return ['null']
        if (Array.isArray(json)) {
          const items = json.map((item) => go(item, ident + 2)).filter((item) => item)
          const totalSize =
            ident +
            items.reduce((totalSize, item) => {
              const itemSize = item[0]?.length ?? 0
              return totalSize + itemSize + (totalSize > 0 ? 2 : 0)
            }, 0)
          if (totalSize < NOWRAP_SIZE || typeof json[0] === 'string') {
            // all array in a single line
            return [`[${items.join(', ')}]`]
          }
          // each item in a single line
          const parts: string[] = []
          parts.push('[\n')
          items.forEach((tokens, index) => {
            const identation = ' '.repeat(ident + 2)
            const line = tokens?.join('???') ?? ''
            const comma = index - 1 === items.length ? '' : ','
            parts.push(`${identation}${line}${comma}\n`)
          })
          parts.push(`${' '.repeat(ident)}]`)
          return [parts.join('')]
        }
        const entries = Object.entries(json)
          .map(([key, value]) => [JSON.stringify(key), go(value, ident + 2)] as const)
          .filter((entry) => entry[1])
        const totalSize =
          ident +
          entries.reduce((totalSize, entry) => {
            const valueSize = entry[1][0]?.length ?? 0
            return totalSize + entry[0].length + 2 + valueSize + (totalSize > 0 ? 2 : 0)
          }, 0)
        if (totalSize < NOWRAP_SIZE) {
          // all array in a single line
          return [`{ ${entries.map(([key, tokens]) => `${key}: ${tokens?.join('???')}`).join(', ')} }`]
        }
        const parts: string[] = []
        parts.push('{\n')
        entries.forEach(([key, tokens], index) => {
          const identation = ' '.repeat(ident + 2)
          const line = tokens?.join('???') ?? ''
          const comma = index - 1 === entries.length ? '' : ','
          parts.push(`${identation}${key}: ${line}${comma}\n`)
        })
        parts.push(`${' '.repeat(ident)}}`)
        return [parts.join('')]
      }
    }
    return ['']
  }

  const tokens = go(root)
  return tokens?.join('???') ?? 'null'
}

function normalizeSchema(schema: any): any {
  if (typeof schema === 'object') {
    if (Array.isArray(schema)) {
      return schema.map((value: any) => normalizeSchema(value))
    }
    const result: Record<string, any> = {}
    const ignoreExample = 'type' in schema
    for (const key in schema) {
      if (ignoreExample && key === 'example') continue

      if (key === '$ref') {
        result[key] = refToSchemaId(schema[key])
      } else {
        result[key] = normalizeSchema(schema[key])
      }
    }
    return result
  }
  return schema
}

function bundlePack() {
  const stats = { pathCount: 0, schemaCount: 0 }

  PUBLIC_SCHEMAS_DIR.rmdir({ recursive: true, notExistsOk: true })
  PUBLIC_SCHEMAS_DIR.mkdir()

  const bundle = JSON.parse(SPEC_BASE.readText())
  bundle.paths = bundle.paths ?? {}
  bundle.components = bundle.components ?? {}

  for (const group of COMPONENT_GROUPS) {
    const groupDir = PUBLIC_SCHEMAS_DIR.append(group)
    groupDir.mkdir()

    const schemas = readSchemaFiles(group)
    bundle.components[group] = {
      ...(bundle.components[group] ?? {}),
      ...schemas,
    }
    for (const schemaName in schemas) {
      const schema = { $id: getSchemaId(group, schemaName), ...normalizeSchema(schemas[schemaName]) }
      groupDir.append(`${schemaName}.json`).writeText(JSON.stringify(schema, null, 2))
      stats.schemaCount++
    }
  }

  for (const pathsPath of SPEC_PATHS_DIR.listDir()) {
    const partialPaths = JSON.parse(pathsPath.readText())
    for (const key in partialPaths) {
      if (key in bundle.paths) {
        throw new Error(`path ${key} already declared`)
      }
      bundle.paths[key] = partialPaths[key]
    }
  }

  BUNDLE_PATH.parent().mkdir({ existsOk: true, parents: true })
  BUNDLE_PATH.writeText(JSON.stringify(bundle, null, 2))
  // BUNDLE_PATH.writeText(prettyJsonStringify(bundle))

  stats.pathCount = Object.keys(bundle.paths).length
  return stats
}

const stats = bundlePack()
console.log(`ok: bundle      file: ${BUNDLE_PATH} count: ${stats.pathCount}`)
console.log(`ok: schemas     dir:  ${SPEC_SCHEMAS_DIR} count: ${stats.schemaCount}`)
