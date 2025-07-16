import type { FormRule } from 'antd'

export const nameIsRequired: FormRule = {
  required: true,
  message: 'Nome é obrigatório',
  validateTrigger: 'onSubmit',
}
