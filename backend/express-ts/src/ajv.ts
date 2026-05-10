import Ajv from 'ajv'
import { Path } from './lib/path'
import { validate as isUuid } from 'uuid'
import {
  isValidCnpj,
  isValidCpf,
  isValidEmail,
  isValidISODate,
  isValidISOTime,
  isValidPhone,
  onlyDigits,
} from './utils'

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
  validate: (data) => isValidEmail(data),
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
  validate: (data) => isValidPhone(data),
})

ajv.addFormat('cpf', {
  type: 'string',
  validate: (data) => isValidCpf(onlyDigits(data)),
})

ajv.addFormat('cnpj', {
  type: 'string',
  validate: (data) => isValidCnpj(onlyDigits(data)),
})

ajv.addFormat('integer', {
  type: 'number',
  validate: (data) => Number.isInteger(data),
})
