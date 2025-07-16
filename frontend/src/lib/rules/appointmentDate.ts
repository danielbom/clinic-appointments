import type { FormRule } from 'antd'
import type { Dayjs } from 'dayjs'

export const appointmentDateIsRequired: FormRule = {
  // required: true, // IT DOES NOT WORK
  validator: (_, value: Dayjs) => {
    if (!value) {
      return Promise.reject('Data do agendamento é obrigatória')
    }
    return Promise.resolve()
  },
  validateTrigger: 'onSubmit',
}

export const appointmentDateIsInvalid: FormRule = {
  validator: (_, value: Dayjs) => {
    if (value && value.isBefore(Date.now())) {
      return Promise.reject('Data do agendamento não pode ser no passado')
    }
    return Promise.resolve()
  },
  validateTrigger: 'onBlur',
}
