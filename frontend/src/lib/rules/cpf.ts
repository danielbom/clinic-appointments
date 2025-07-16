import type { FormRule } from 'antd'

export const cpfIsRequired: FormRule = {
  required: true,
  message: 'CPF é obrigatório',
  validateTrigger: 'onSubmit',
}

export const cpfIsInvalid: FormRule = {
  pattern: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
  message: 'CPF inválido',
  validateTrigger: 'onBlur',
}
