import type { FormRule } from 'antd'
import type { Dayjs } from 'dayjs'

export const birthdateIsRequired: FormRule = {
  // required: true, // IT DOES NOT WORK
  validator: (_, value: Dayjs) => {
    if (!value) {
      return Promise.reject('Data de nascimento é obrigatória')
    }
    return Promise.resolve()
  },
  validateTrigger: 'onSubmit',
}

export const birthdateIsInvalid: FormRule = {
  validator: (_, value: Dayjs) => {
    if (value && value.isAfter(Date.now())) {
      return Promise.reject('Data de nascimento não pode ser no futuro')
    }
    return Promise.resolve()
  },
  validateTrigger: 'onBlur',
}
