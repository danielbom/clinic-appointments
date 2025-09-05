import { useMemo, useState } from 'react'
import { AutoComplete, Form, FormInstance, Input, InputNumber, Select } from 'antd'

import FormX from '../../../FormX'
import renderMoney from '../../../../lib/renders/renderMoney'
import renderDuration from '../../../../lib/renders/renderDuration'

import { Service } from './types'

type FormServiceSpecialist = {
  id: string
  name: string
}

export type ServiceItem = {
  id: string
  name: string
}

export type ServicesGroup = {
  id: string
  name: string
  items: ServiceItem[]
}

type FormServiceValues = {
  specialistId: string
  serviceId: string
  price: number
  duration: number
}

const INITIAL_VALUES: FormServiceValues = {
  specialistId: '',
  serviceId: '',
  duration: 0,
  price: 0,
}

export interface FormServiceProps {
  record?: Service
  specialists: FormServiceSpecialist[]
  services: ServicesGroup[]
  onSubmit: (values: FormServiceValues) => void
  onClose: () => void
}

function FormService({ record, specialists, services, onSubmit, onClose }: FormServiceProps) {
  const [form] = Form.useForm<FormServiceValues>()
  const editing = !!record
  const duration = Form.useWatch('duration', form)

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
          <SelectSpecialist record={record} specialists={specialists} />
          <AutocompleteService form={form} record={record} services={services} />

          <Form.Item<FormServiceValues> label="Preço" name="price" required>
            <InputNumber<number>
              addonBefore="R$"
              formatter={(value) => (value ? renderMoney(value, '') : '')}
              parser={(value) => parseInt((value ?? '0').replace(/\D/g, ''), 10)}
              step={100}
            />
          </Form.Item>

          <Form.Item<FormServiceValues> label="Duração" name="duration" required>
            <InputNumber<number> addonAfter={renderDuration(duration)} suffix="min." min={0} max={8 * 60} />
          </Form.Item>

          <FormX.Save
            onClick={() => {
              form.validateFields().then((values) => {
                if (record) {
                  onSubmit({
                    ...values,
                    serviceId: record.serviceNameId,
                    specialistId: record.specialistId,
                  })
                } else {
                  onSubmit(values)
                }
              })
            }}
          />
        </Form>
      </FormX.Container>
    </div>
  )
}

interface SelectSpecialistProps {
  record?: Service
  specialists: FormServiceSpecialist[]
}

function SelectSpecialist({ record, specialists }: SelectSpecialistProps) {
  const editing = !!record

  if (editing) {
    const specialist = specialists.find((it) => it.id === record!.specialistId)
    return (
      <Form.Item label="Especialista">
        <Input readOnly value={specialist?.name || ''} />
      </Form.Item>
    )
  } else {
    return (
      <Form.Item<FormServiceValues> label="Especialista" name="specialistId" required>
        <Select
          showSearch
          allowClear
          filterOption={(input, option) => {
            if (!input || !option) return true
            return option.label.toLowerCase().includes(input.toLowerCase())
          }}
          options={specialists.map((it) => ({
            label: it.name,
            value: it.id,
          }))}
        />
      </Form.Item>
    )
  }
}

interface AutocompleteServiceProps {
  form: FormInstance<FormServiceValues>
  record?: Service
  services: ServicesGroup[]
}
function AutocompleteService({ form, record, services }: AutocompleteServiceProps) {
  const [autocompleteValue, setAutocompleteValue] = useState<string>('')
  const options = useMemo(() => {
    return services
      .map((group) => ({
        label: group.name,
        options: group.items.map((service) => ({
          value: service.id,
          title: service.name,
          label: service.name,
        })),
      }))
      .filter((it) => it.options.length > 0)
  }, [services])
  const editing = !!record

  if (editing) {
    const service = services.flatMap((it) => it.items).find((it) => it.id === record!.serviceNameId)
    return (
      <Form.Item label="Serviço">
        <Input readOnly value={service?.name || ''} />
      </Form.Item>
    )
  } else {
    return (
      <>
        <Form.Item<FormServiceValues> label="Serviço" name="serviceId" required hidden>
          <Input />
        </Form.Item>

        <Form.Item<FormServiceValues> label="Serviço" required>
          <AutoComplete
            options={options}
            onChange={(value) => {
              setAutocompleteValue(value)
              form.setFieldValue('serviceId', null)
            }}
            value={autocompleteValue}
            filterOption={(inputValue, option) => {
              if (!inputValue || !option) return true
              return option.label.toLowerCase().includes(inputValue.toLowerCase())
            }}
            onSelect={(_, option) => {
              setAutocompleteValue((option as any).title || '')
              form.setFieldValue('serviceId', (option as any).value || '')
            }}
          />
        </Form.Item>
      </>
    )
  }
}

function prepareInitialValues(record?: Service): FormServiceValues {
  if (!record) return INITIAL_VALUES
  return {
    duration: record.duration,
    price: record.price,
    serviceId: record.serviceNameId,
    specialistId: record.specialistId,
  }
}

export default FormService
