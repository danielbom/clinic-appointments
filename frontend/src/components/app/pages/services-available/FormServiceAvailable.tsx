import { useState } from 'react'
import { Button, Form, Input, Select } from 'antd'
import { PlusOutlined, UnorderedListOutlined } from '@ant-design/icons'

import FormX from '../../../FormX'

import { nameIsRequired } from '../../../../lib/rules/name'

import { ServiceAvailable } from './types'

type FormServiceAvailableValues = {
  name: string
  specialization: string
  specializationId: string
}

type FormServiceAvailableSpecialization = {
  id: string
  name: string
}

const INITIAL_VALUES: FormServiceAvailableValues = {
  name: '',
  specialization: '',
  specializationId: '',
}

export type FormServiceAvailableProps = {
  record?: ServiceAvailable
  specializations: FormServiceAvailableSpecialization[]
  onSubmit: (values: FormServiceAvailableValues) => void
  onClose: () => void
}

function FormServiceAvailable({ onSubmit, record, specializations, onClose }: FormServiceAvailableProps) {
  const [form] = Form.useForm<FormServiceAvailableValues>()
  const editing = !!record
  const [addSpecialization, setAddSpecialization] = useState(true)

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
          <InputSpecialization
            record={record}
            specializations={specializations}
            addSpecialization={addSpecialization}
            setAddSpecialization={setAddSpecialization}
          />

          <Form.Item<FormServiceAvailableValues> label="Nome" name="name" required rules={[nameIsRequired]}>
            <Input />
          </Form.Item>

          <FormX.Save
            onClick={() => {
              form.validateFields().then((values) => {
                if (addSpecialization) {
                  values.specializationId = ''
                } else {
                  values.specialization = ''
                }
                onSubmit(values)
              })
            }}
          />
        </Form>
      </FormX.Container>
    </div>
  )
}

type InputSpecializationProps = {
  specializations: FormServiceAvailableSpecialization[]
  record?: ServiceAvailable
  addSpecialization: boolean
  setAddSpecialization: (val: boolean) => void
}

function InputSpecialization({
  specializations,
  record,
  addSpecialization,
  setAddSpecialization,
}: InputSpecializationProps) {
  const editing = !!record
  if (editing) {
    return (
      <Form.Item<FormServiceAvailableValues> label="Especialização" name="specialization">
        <Input readOnly />
      </Form.Item>
    )
  } else if (addSpecialization) {
    return (
      <div style={{ paddingBottom: '24px' }}>
        <Form.Item<FormServiceAvailableValues>
          label="Especialização"
          name="specialization"
          required={!editing}
          style={{ marginBottom: '8px' }}
        >
          <Input placeholder='Adicionar Especialização...' />
        </Form.Item>
        {!editing && (
          <Button type="primary" icon={<UnorderedListOutlined />} onClick={() => setAddSpecialization(false)}>
            Selecionar Especialização
          </Button>
        )}
      </div>
    )
  } else {
    return (
      <div style={{ paddingBottom: '24px' }}>
        <Form.Item<FormServiceAvailableValues>
          label="Especialização"
          name="specializationId"
          required
          hidden={addSpecialization}
          style={{ marginBottom: '8px' }}
        >
          <Select
            showSearch
            allowClear
            placeholder="Buscar Especialização"
            disabled={editing}
            filterOption={(input, option) => {
              if (!input || !option) return false
              return option.value.toLowerCase().includes(input.toLowerCase())
            }}
            options={specializations.map((it) => ({
              label: it.name,
              value: it.id,
            }))}
          />
        </Form.Item>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddSpecialization(true)}>
          Adicionar Nova Especialização
        </Button>
      </div>
    )
  }
}

function prepareInitialValues(record?: ServiceAvailable): FormServiceAvailableValues {
  if (!record) return INITIAL_VALUES
  return record
}

export default FormServiceAvailable
