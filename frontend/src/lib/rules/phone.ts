import type { FormRule } from 'antd'

export const phoneIsRequired: FormRule = {
  required: true,
  message: 'Número de telefone é obrigatório',
  validateTrigger: 'onSubmit',
}
export const phoneIsInvalid: FormRule = {
  pattern: /^\(\d{2}\) (\d )?\d{4}-\d{4}$/,
  message: 'Número de telefone inválido',
  validateTrigger: 'onSubmit',
}
