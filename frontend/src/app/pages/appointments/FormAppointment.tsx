import { useEffect } from 'react'
import { SearchOutlined } from '@ant-design/icons'
import { Form, Select, DatePicker, TimePicker, Button, Input } from 'antd'
import dayjs, { Dayjs } from 'dayjs'

import FormX from '../../../components/FormX'

import normalizeCPF from '../../../lib/normalizers/normalizeCPF'
import { appointmentDateIsRequired, appointmentDateIsInvalid } from '../../../lib/rules/appointmentDate'
import { appointmentTimeIsRequired } from '../../../lib/rules/appointmentTime'
import { Appointment, AppointmentStatus } from '../../../lib/api'

const OPTIONS_STATUS = [
  { label: 'Pendente', value: AppointmentStatus.Pending },
  { label: 'Cancelado', value: AppointmentStatus.Canceled },
  { label: 'Realizado', value: AppointmentStatus.Realized },
]

type FormAppointmentService = {
  id: string
  specialization: string
  serviceName: string
  specialistName: string
}

type FormAppointmentCustomer = {
  id: string
  name: string
  cpf: string
}

type FormAppointmentValues = {
  customerId: string
  serviceId: string
  date: Dayjs
  time: Dayjs
  status: number
}

const INITIAL_VALUES: FormAppointmentValues = {
  customerId: '',
  serviceId: '',
  date: null as any,
  time: null as any,
  status: AppointmentStatus.Pending,
}

export type FormAppointmentProps = {
  record?: Appointment
  services: FormAppointmentService[]
  customers: FormAppointmentCustomer[]
  onClickSearchCustomer: () => void
  onClickSearchService: () => void
  onSubmit: (values: FormAppointmentValues) => void
  onClose: () => void
}

function FormAppointment({
  record,
  services,
  customers,
  onClickSearchCustomer,
  onClickSearchService,
  onSubmit,
  onClose,
}: FormAppointmentProps) {
  const [form] = Form.useForm<FormAppointmentValues>()
  const editing = !!record

  useEffect(() => {
    if (services.length === 1) {
      form.setFieldValue('serviceId', services[0].id)
    }
  }, [form, services])

  return (
    <div>
      <FormX.Header title={editing ? 'Editar' : 'Criar'} onClose={onClose} />

      <FormX.Container>
        <Form
          form={form}
          layout="vertical"
          initialValues={prepareInitialValues(record)}
          validateTrigger={['onBlur', 'onSubmit']}
        >
          <SelectCustomer record={record} customers={customers} onClickSearchCustomer={onClickSearchCustomer} />
          <SelectService record={record} services={services} onClickSearchService={onClickSearchService} />

          <Form.Item<FormAppointmentValues>
            label="Data"
            name="date"
            required
            rules={editing ? [appointmentDateIsRequired] : [appointmentDateIsRequired, appointmentDateIsInvalid]}
          >
            <DatePicker format="DD-MM-YYYY" />
          </Form.Item>
          <Form.Item<FormAppointmentValues> label="Hora" name="time" required rules={[appointmentTimeIsRequired]}>
            <TimePicker minuteStep={5} format="hh:mm A" />
          </Form.Item>

          <Form.Item<FormAppointmentValues> label="Status" name="status" required>
            <Select options={OPTIONS_STATUS} />
          </Form.Item>

          <FormX.Save
            onClick={() => {
              form.validateFields().then((values) => {
                onSubmit(values)
              })
            }}
          />
        </Form>
      </FormX.Container>
    </div>
  )
}

type SelectCustomerProps = {
  record?: Appointment
  customers: FormAppointmentCustomer[]
  onClickSearchCustomer: () => void
}

function SelectCustomer({ record, customers, onClickSearchCustomer }: SelectCustomerProps) {
  const editing = !!record
  if (editing) {
    return (
      <Form.Item label="Cliente">
        <Input readOnly value={record?.customerName ?? ''} />
      </Form.Item>
    )
  } else {
    return (
      <div style={{ paddingBottom: '24px' }}>
        <Form.Item<FormAppointmentValues> label="Cliente" name="customerId" required style={{ marginBottom: '8px' }}>
          <Select
            disabled={editing}
            showSearch
            placeholder="Selecione um cliente"
            filterOption={(input, option) => option?.value.toLowerCase().includes(input.toLowerCase()) ?? false}
            options={customers.map((it) => ({
              label: `${it.name} (${normalizeCPF(it.cpf)})`,
              value: it.id,
            }))}
          />
        </Form.Item>
        <Button disabled={editing} type="primary" icon={<SearchOutlined />} onClick={onClickSearchCustomer}>
          Procurar cliente
        </Button>
      </div>
    )
  }
}

type SelectServiceProps = {
  record?: Appointment
  services: FormAppointmentService[]
  onClickSearchService: () => void
}

function SelectService({ record, services, onClickSearchService }: SelectServiceProps) {
  const editing = !!record
  if (editing) {
    return (
      <Form.Item label="Serviço">
        <Input readOnly value={record?.serviceName || ''} />
      </Form.Item>
    )
  } else {
    return (
      <div style={{ paddingBottom: '24px' }}>
        <Form.Item<FormAppointmentValues> label="Serviço" name="serviceId" required style={{ marginBottom: '8px' }}>
          <Select
            disabled={editing}
            showSearch
            placeholder="Selecione um serviço"
            filterOption={(input, option) => option?.value.toLowerCase().includes(input.toLowerCase()) ?? false}
            options={services.map((it) => ({
              label: `${it.specialization} | ${it.serviceName} (${it.specialistName})`,
              value: it.id,
            }))}
          />
        </Form.Item>
        <Button disabled={editing} type="primary" icon={<SearchOutlined />} onClick={onClickSearchService}>
          Procurar serviço
        </Button>
      </div>
    )
  }
}

function prepareInitialValues(record?: Appointment): FormAppointmentValues {
  if (!record) return INITIAL_VALUES
  return {
    serviceId: record.serviceNameId,
    customerId: record.customerId,
    time: dayjs(record.time, 'HH:mm:ss'),
    date: dayjs(record.date),
    status: record.status,
  }
}

export default FormAppointment
