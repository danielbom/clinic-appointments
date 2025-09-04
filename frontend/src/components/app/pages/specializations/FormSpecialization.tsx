import { Form, Input } from 'antd'

import FormX from '../../../FormX'

import { nameIsRequired } from '../../../../lib/rules/name'
import { Specialization } from './types'

type FormSpecializationValues = {
  name: string
}

const INITIAL_VALUES: FormSpecializationValues = {
  name: '',
}

export type FormSpecializationProps = {
  record?: Specialization
  onSubmit: (values: FormSpecializationValues) => void
  onClose: () => void
}

function FormSpecialization({ record, onSubmit, onClose }: FormSpecializationProps) {
  const [form] = Form.useForm<FormSpecializationValues>()
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
          <Form.Item<FormSpecializationValues> label="Nome" name="name" required rules={[nameIsRequired]}>
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

function prepareInitialValues(record?: Specialization): FormSpecializationValues {
  if (!record) return INITIAL_VALUES
  return {
    name: record.name,
  }
}

export default FormSpecialization
