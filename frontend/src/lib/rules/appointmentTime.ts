import type { FormRule } from 'antd'
import type { Dayjs } from 'dayjs'

export const appointmentTimeIsRequired: FormRule = {
  // required: true, // IT DOES NOT WORK
  validator: (_, value: Dayjs) => {
    if (!value) {
      return Promise.reject('Hora do agendamento é obrigatória')
    }
    return Promise.resolve()
  },
  validateTrigger: 'onSubmit',
}
