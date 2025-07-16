import { Form, Input, DatePicker } from 'antd'
import dayjs, { Dayjs } from 'dayjs'

import FormX from '../../../components/FormX'
import normalizeCPF from '../../../lib/normalizers/normalizeCPF'
import normalizePhone from '../../../lib/normalizers/normalizePhone'

import { birthdateIsRequired, birthdateIsInvalid } from '../../../lib/rules/birthdate'
import { cpfIsRequired, cpfIsInvalid } from '../../../lib/rules/cpf'
import { emailIsInvalid } from '../../../lib/rules/email'
import { nameIsRequired } from '../../../lib/rules/name'
import { phoneIsRequired, phoneIsInvalid } from '../../../lib/rules/phone'
import { Customer } from './types'

type FormCustomerValues = {
  name: string
  email: string
  phone: string
  birthdate: Dayjs
  cpf: string
}

const INITIAL_VALUES: FormCustomerValues = {
  name: '',
  email: '',
  phone: '',
  birthdate: null as any,
  cpf: '',
}

export type FormCustomerProps = {
  record?: Customer
  onSubmit: (values: FormCustomerValues) => void
  onClose: () => void
}

function FormCustomer({ record, onSubmit, onClose }: FormCustomerProps) {
  const [form] = Form.useForm<FormCustomerValues>()
  const editing = !!record

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
          <Form.Item<FormCustomerValues> label="Nome" name="name" required rules={[nameIsRequired]}>
            <Input />
          </Form.Item>
          <Form.Item<FormCustomerValues> label="E-mail" name="email" rules={[emailIsInvalid]}>
            <Input type="email" />
          </Form.Item>
          <Form.Item<FormCustomerValues>
            label="Telefone"
            name="phone"
            required
            normalize={normalizePhone}
            rules={[phoneIsRequired, phoneIsInvalid]}
          >
            <Input />
          </Form.Item>
          <Form.Item<FormCustomerValues>
            label="Data de Nascimento"
            name="birthdate"
            required
            rules={[birthdateIsRequired, birthdateIsInvalid]}
          >
            <DatePicker format="DD-MM-YYYY" />
          </Form.Item>
          <Form.Item<FormCustomerValues>
            label="CPF"
            name="cpf"
            required
            normalize={normalizeCPF}
            rules={[cpfIsRequired, cpfIsInvalid]}
          >
            <Input />
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

function prepareInitialValues(record?: Customer): FormCustomerValues {
  if (!record) return INITIAL_VALUES
  return {
    birthdate: dayjs(record.birthdate),
    cpf: normalizeCPF(record.cpf),
    email: record.email,
    name: record.name,
    phone: normalizePhone(record.phone),
  }
}

export default FormCustomer
