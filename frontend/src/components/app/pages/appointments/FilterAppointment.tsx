import { DatePicker, Form, Input, Select } from 'antd'
import { Dayjs } from 'dayjs'

import FilterX from '../../../FilterX'
import { AppointmentStatus } from '../../../../lib/api'

export type FilterAppointmentValues = {
  dateInterval?: null | [Dayjs | undefined, Dayjs | undefined]
  serviceName?: string
  specialist?: string
  customer?: string
  status?: number
}

export type FilterAppointmentProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (values: FilterAppointmentValues) => void
}

function FilterAppointment({ isOpen, onClose, onSubmit }: FilterAppointmentProps) {
  const [form] = Form.useForm()
  return (
    <FilterX.Drawer
      isOpen={isOpen}
      onClose={onClose}
      onClickApply={() => form.validateFields().then(onSubmit)}
      onClickReset={() => form.resetFields()}
    >
      <Form form={form} layout="vertical" validateTrigger={['onBlur']}>
        <Form.Item<FilterAppointmentValues> label="Intervalo de datas" name="dateInterval">
          <DatePicker.RangePicker allowEmpty />
        </Form.Item>
        <Form.Item<FilterAppointmentValues> label="Cliente" name="customer">
          <Input />
        </Form.Item>
        <Form.Item<FilterAppointmentValues> label="Serviço" name="serviceName">
          <Input />
        </Form.Item>
        <Form.Item<FilterAppointmentValues> label="Especialista" name="specialist">
          <Input />
        </Form.Item>
        <Form.Item<FilterAppointmentValues> label="Status" name="status">
          <Select
            allowClear
            options={[
              { label: 'Pendente', value: AppointmentStatus.Pending },
              { label: 'Realizado', value: AppointmentStatus.Realized },
              { label: 'Canceled', value: AppointmentStatus.Canceled },
            ]}
          />
        </Form.Item>
      </Form>
    </FilterX.Drawer>
  )
}

export default FilterAppointment
