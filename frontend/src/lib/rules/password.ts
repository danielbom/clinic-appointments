import type { FormRule } from 'antd'

export const passwordIsRequired: FormRule = {
  required: true,
  message: 'Senha é obrigatório',
  validateTrigger: 'onSubmit',
}

export const passwordIsInvalid: FormRule = {
  validator: (_, value: string) => {
    if (!value) {
      return Promise.resolve()
    }
    if (value.length < 2) {
      return Promise.reject('Senha deve ter no mínimo 2 caracteres')
    }
    if (value.length > 20) {
      return Promise.reject('Senha deve ter no máximo 20 caracteres')
    }
    return Promise.resolve()
  },
  validateTrigger: 'onSubmit',
}
