import type { FormRule } from 'antd'

export const cnpjIsRequired: FormRule = {
  required: true,
  message: 'CNPJ é obrigatório',
  validateTrigger: 'onSubmit',
}

export const cnpjIsInvalid: FormRule = {
  pattern: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
  message: 'CNPJ inválido',
  validateTrigger: 'onBlur',
}
