import { Form, Input, DatePicker } from 'antd'
import { EyeInvisibleOutlined, EyeTwoTone, LockOutlined } from '@ant-design/icons'
import dayjs, { Dayjs } from 'dayjs'

import { Secretary } from './types'

import FormX from '../../../FormX'
import normalizeCPF from '../../../../lib/normalizers/normalizeCPF'
import normalizeCNPJ from '../../../../lib/normalizers/normalizeCNPJ'
import normalizePhone from '../../../../lib/normalizers/normalizePhone'

import { birthdateIsRequired, birthdateIsInvalid } from '../../../../lib/rules/birthdate'
import { cnpjIsInvalid, cnpjIsRequired } from '../../../../lib/rules/cnpj'
import { cpfIsRequired, cpfIsInvalid } from '../../../../lib/rules/cpf'
import { emailIsInvalid } from '../../../../lib/rules/email'
import { nameIsRequired } from '../../../../lib/rules/name'
import { passwordIsInvalid, passwordIsRequired } from '../../../../lib/rules/password'
import { phoneIsRequired, phoneIsInvalid } from '../../../../lib/rules/phone'

type FormSecretaryValues = {
  name: string
  email: string
  phone: string
  password: string
  birthdate: Dayjs
  cpf: string
  cnpj: string
}

const INITIAL_VALUES: FormSecretaryValues = {
  name: '',
  email: '',
  phone: '',
  password: '',
  birthdate: null as any,
  cpf: '',
  cnpj: '',
}

export interface FormSecretaryProps {
  record?: Secretary
  onSubmit: (values: FormSecretaryValues) => void
  onClose: () => void
}

function FormSecretary({ record, onSubmit, onClose }: FormSecretaryProps) {
  const [form] = Form.useForm<FormSecretaryValues>()
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
          <Form.Item<FormSecretaryValues> label="Nome" name="name" required rules={[nameIsRequired]}>
            <Input maxLength={256} />
          </Form.Item>
          <Form.Item<FormSecretaryValues> label="E-mail" name="email" rules={[emailIsInvalid]}>
            <Input maxLength={256} type="email" />
          </Form.Item>
          <Form.Item<FormSecretaryValues>
            label="Telefone"
            name="phone"
            required
            normalize={normalizePhone}
            rules={[phoneIsRequired, phoneIsInvalid]}
          >
            <Input maxLength={20} />
          </Form.Item>
          <Form.Item<FormSecretaryValues>
            label="Data de Nascimento"
            name="birthdate"
            required
            rules={[birthdateIsRequired, birthdateIsInvalid]}
          >
            <DatePicker format="DD-MM-YYYY" />
          </Form.Item>
          <Form.Item<FormSecretaryValues>
            label="CPF"
            name="cpf"
            required
            normalize={normalizeCPF}
            rules={[cpfIsRequired, cpfIsInvalid]}
          >
            <Input maxLength={20} />
          </Form.Item>
          <Form.Item<FormSecretaryValues>
            label="CNPJ"
            name="cnpj"
            required
            normalize={normalizeCNPJ}
            rules={[cnpjIsRequired, cnpjIsInvalid]}
          >
            <Input maxLength={20} />
          </Form.Item>
          <Form.Item<FormSecretaryValues>
            label="Senha"
            name="password"
            required={!editing}
            rules={editing ? [passwordIsInvalid] : [passwordIsRequired, passwordIsInvalid]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              minLength={2}
              maxLength={20}
            />
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

function prepareInitialValues(record?: Secretary): FormSecretaryValues {
  if (!record) return INITIAL_VALUES
  return {
    birthdate: dayjs(record.birthdate),
    cpf: normalizeCPF(record.cpf),
    cnpj: normalizeCNPJ(record.cnpj),
    password: '',
    email: record.email,
    name: record.name,
    phone: normalizePhone(record.phone),
  }
}

export default FormSecretary
