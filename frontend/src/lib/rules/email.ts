import type { FormRule } from 'antd'

export const emailIsRequired: FormRule = {
  required: true,
  message: 'E-mail é obrigatório',
  validateTrigger: 'onSubmit',
}

export const emailIsInvalid: FormRule = {
  type: 'email',
  message: 'E-mail inválido',
}
