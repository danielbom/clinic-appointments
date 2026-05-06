import Ajv from 'ajv'
import { Path } from './lib/path'
import { validate as isUuid } from 'uuid'
import { isValidISODate, isValidISOTime } from './utils'

export const ajv = new Ajv({})

const SCHEMAS_DIR = Path.from(import.meta.dirname).append('public/schemas')

for (const component of ['domain', 'body', 'schemas']) {
  for (const file of SCHEMAS_DIR.append(component).listDir()) {
    const content = file.readText()
    const schema = JSON.parse(content)
    ajv.addSchema(schema)
  }
}

ajv.addFormat('email', {
  type: 'string',
  validate: (data) => {
    const parts = data.split('@')
    if (parts.length !== 2) return false
    if (parts[0].length === 0) return false
    if (parts[1].length === 0) return false
    return true
  },
})

ajv.addFormat('uuid', {
  type: 'string',
  validate: (data) => isUuid(data),
})

ajv.addFormat('date', {
  type: 'string',
  validate: (data) => isValidISODate(data),
})

ajv.addFormat('time', {
  type: 'string',
  validate: (data) => isValidISOTime(data),
})

ajv.addFormat('phone', {
  type: 'string',
  validate: (data) => true,
})

ajv.addFormat('cpf', {
  type: 'string',
  validate: (data) => true,
})

ajv.addFormat('cnpj', {
  type: 'string',
  validate: (data) => true,
})

ajv.addFormat('integer', {
  type: 'number',
  validate: (data) => Number.isInteger(data),
})
