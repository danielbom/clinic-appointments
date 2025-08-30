import { useState } from 'react'
import { CloseOutlined } from '@ant-design/icons'
import {
  Form,
  Input,
  DatePicker,
  Steps,
  Divider,
  Typography,
  Row,
  Col,
  Card,
  Space,
  InputNumber,
  AutoComplete,
  Flex,
  Descriptions,
} from 'antd'
import dayjs, { Dayjs } from 'dayjs'

import { Specialist, SpecialistSpecialization } from './types'

import FormX from '../../../components/FormX'
import normalizeCPF from '../../../lib/normalizers/normalizeCPF'
import normalizeCNPJ from '../../../lib/normalizers/normalizeCNPJ'
import normalizePhone from '../../../lib/normalizers/normalizePhone'

import renderMoney from '../../../lib/renders/renderMoney'
import renderDuration from '../../../lib/renders/renderDuration'
import { birthdateIsRequired, birthdateIsInvalid } from '../../../lib/rules/birthdate'
import { cnpjIsRequired, cnpjIsInvalid } from '../../../lib/rules/cnpj'
import { cpfIsRequired, cpfIsInvalid } from '../../../lib/rules/cpf'
import { emailIsRequired, emailIsInvalid } from '../../../lib/rules/email'
import { nameIsRequired } from '../../../lib/rules/name'
import { phoneIsRequired, phoneIsInvalid } from '../../../lib/rules/phone'
import { specialistServicesIsRequired } from '../../../lib/rules/specialistServices'

// development
const INITIAL_STEP = 0
const VALIDATE = true

type Step1Values = {
  name: string
  email: string
  phone: string
  birthdate: Dayjs
  cpf: string
  cnpj: string
}

type Step2Service = {
  key: string
  name: string
  price: number
  duration: number
}

type Step2Values = {
  services: Step2Service[]
}

type FormSpecialistServiceValues = {
  serviceId: string
  price: number
  duration: number
}

type FormSpecialistValues = {
  name: string
  email: string
  phone: string
  birthdate: Dayjs
  cpf: string
  cnpj: string
  services: FormSpecialistServiceValues[]
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

type Step1Props = {
  editing: boolean
  show: boolean
  initialValues?: Step1Values
  onClickNext: (values: Step1Values) => void
}

function Step1({ initialValues, show, onClickNext }: Step1Props) {
  const [form] = Form.useForm<Step1Values>()

  if (!show) {
    return null
  }

  return (
    <Form form={form} layout="vertical" initialValues={initialValues} validateTrigger={['onBlur', 'onSubmit']}>
      <Form.Item<Step1Values> label="Nome" name="name" required rules={[nameIsRequired]}>
        <Input />
      </Form.Item>
      <Form.Item<Step1Values> label="E-mail" name="email" required rules={[emailIsRequired, emailIsInvalid]}>
        <Input type="email" />
      </Form.Item>
      <Form.Item<Step1Values>
        label="Telefone"
        name="phone"
        required
        normalize={normalizePhone}
        rules={[phoneIsRequired, phoneIsInvalid]}
      >
        <Input />
      </Form.Item>
      <Form.Item<Step1Values>
        label="Data de Nascimento"
        name="birthdate"
        required
        rules={[birthdateIsRequired, birthdateIsInvalid]}
      >
        <DatePicker format="DD-MM-YYYY" />
      </Form.Item>
      <Form.Item<Step1Values>
        label="CPF"
        name="cpf"
        required
        normalize={normalizeCPF}
        rules={[cpfIsRequired, cpfIsInvalid]}
      >
        <Input />
      </Form.Item>
      <Form.Item<Step1Values>
        label="CNPJ"
        name="cnpj"
        required
        normalize={normalizeCNPJ}
        rules={[cnpjIsRequired, cnpjIsInvalid]}
      >
        <Input />
      </Form.Item>

      <FormX.NextPrevious
        previousDisabled
        onClickNext={() => {
          const promiseValues = VALIDATE ? form.validateFields() : Promise.resolve(form.getFieldsValue())
          promiseValues.then((values) => {
            onClickNext(values)
          })
        }}
      />
    </Form>
  )
}

type Step2Props = {
  editing: boolean
  show: boolean
  groups: ServicesGroup[]
  initialValues?: Step2Values
  onClickPrevious: () => void
  onClickNext: (values: Step2Values) => void
}

function Step2({ show, groups, initialValues, onClickPrevious, onClickNext }: Step2Props) {
  const [form] = Form.useForm<Step2Values>()
  const [serviceIds, setServiceIds] = useState<string[]>(() => initialValues?.services.map((it) => it.key) || [])

  const services: Step2Values['services'] | undefined = Form.useWatch(['services'], form)

  if (!show) {
    return null
  }

  return (
    <Form form={form} layout="vertical" initialValues={initialValues} validateTrigger={['onBlur', 'onSubmit']}>
      <Form.List name="services" rules={[specialistServicesIsRequired]}>
        {(_, { add, remove }, { errors }) => {
          return (
            <>
              <SelectService
                groups={groups}
                onSelect={(option) => {
                  setServiceIds((serviceIds) => [...serviceIds, option.value])
                  const newValue: Step2Values['services'][number] = {
                    key: option.value,
                    name: option.label,
                    duration: 0,
                    price: 0,
                  }
                  add(newValue)
                }}
                serviceIds={serviceIds}
              />

              <Space direction="vertical" style={{ width: '100%' }}>
                {services &&
                  groups.map((group) => {
                    const groupServices = group.items.filter((it) => serviceIds.includes(it.id))

                    if (groupServices.length === 0) {
                      return null
                    }

                    return (
                      <Card key={group.id} title={group.name}>
                        {group.items.map((item) => {
                          const currentIndex = services.findIndex((it) => it.key === item.id)
                          if (currentIndex === -1) {
                            return null
                          }
                          const service = services[currentIndex]

                          return (
                            <Flex key={service.key} align="baseline" flex="1">
                              <Row style={{ width: '100%' }}>
                                <Col xs={24} md={8} style={{ alignItems: 'center', display: 'flex' }}>
                                  <Form.Item shouldUpdate={false}>
                                    <Typography.Text>{service.name}</Typography.Text>
                                  </Form.Item>
                                </Col>

                                <Col xs={24} md={7} style={{ padding: '0.25rem' }}>
                                  <Form.Item<Step2Values['services']>
                                    label="Preço"
                                    name={[currentIndex, 'price']}
                                    required
                                  >
                                    <InputNumber<number>
                                      addonBefore="R$"
                                      formatter={(value) => (value ? renderMoney(value, '') : '')}
                                      parser={(value) => parseInt((value ?? '0').replace(/\D/g, ''), 10)}
                                      step={100}
                                    />
                                  </Form.Item>
                                </Col>

                                <Col xs={24} md={7} style={{ padding: '0.25rem' }}>
                                  <Form.Item<Step2Values['services']>
                                    label="Duração"
                                    name={[currentIndex, 'duration']}
                                    required
                                  >
                                    <InputNumber<number>
                                      addonAfter={renderDuration(services?.[currentIndex]?.duration || 0)}
                                      suffix="min."
                                      min={0}
                                      max={8 * 60}
                                    />
                                  </Form.Item>
                                </Col>
                              </Row>

                              <CloseOutlined
                                style={{ padding: '1rem 0' }}
                                onClick={() => {
                                  setServiceIds((serviceIds) => serviceIds.filter((id) => id !== item.id))
                                  remove(currentIndex)
                                }}
                              />
                            </Flex>
                          )
                        })}
                      </Card>
                    )
                  })}
              </Space>

              <Form.ErrorList errors={errors} />
            </>
          )
        }}
      </Form.List>

      <FormX.NextPrevious
        onClickPrevious={onClickPrevious}
        onClickNext={() => {
          const promiseValues = VALIDATE ? form.validateFields() : Promise.resolve(form.getFieldsValue())
          promiseValues.then((values) => {
            // patching
            let index = 0
            groups.forEach((group) => {
              group.items.forEach((it) => {
                if (serviceIds.includes(it.id)) {
                  values.services[index].key = it.id
                  values.services[index].name = it.name
                  index += 1
                }
              })
            })
            onClickNext(values)
          })
        }}
      />
    </Form>
  )
}

type SelectServiceProps = {
  groups: ServicesGroup[]
  serviceIds: string[]
  onSelect: (option: { value: string; label: string }) => void
}

function SelectService({ groups, serviceIds, onSelect }: SelectServiceProps) {
  const [autocompleteValue, setAutocompleteValue] = useState<string>('')
  const [autocompleteOpen, setAutocompleteOpen] = useState<boolean>(false)

  return (
    <Form.Item<Step2Values> label="Serviços">
      <Flex>
        <AutoComplete
          options={groups
            .map((group) => ({
              value: 'group+' + group.id,
              label: group.name,
              options: group.items
                .map((service) => ({
                  value: service.id,
                  disabled: serviceIds.includes(service.id),
                  label: service.name,
                }))
                .filter(
                  (it) => autocompleteValue === '' || it.label.toLowerCase().includes(autocompleteValue.toLowerCase()),
                ),
            }))
            .filter((it) => it.options.length > 0)}
          onSelect={(_, option) => {
            setAutocompleteValue(autocompleteValue)
            onSelect(option)
          }}
          open={autocompleteOpen}
          onClick={() => setAutocompleteOpen(true)}
          onBlur={() => setAutocompleteOpen(false)}
          onChange={setAutocompleteValue}
          value={autocompleteValue}
          allowClear
          onClear={() => setAutocompleteValue('')}
        />
      </Flex>
    </Form.Item>
  )
}

type StepsValues = [Step1Values | undefined, Step2Values | undefined]

type Step3Props = {
  editing: boolean
  values: StepsValues
  show: boolean
  onClickPrevious: () => void
  onClickSave: () => void
}

function Step3({ editing, values, show, onClickSave, onClickPrevious }: Step3Props) {
  if (!show) {
    return null
  }

  return (
    <div>
      <Typography.Title level={2}>Concluir</Typography.Title>

      <Typography.Paragraph>Confirme os dados e clique em "Criar" para finalizar o cadastro.</Typography.Paragraph>

      <Descriptions title="Dados Pessoais" layout="horizontal" size="small" column={1}>
        <Descriptions.Item label="Nome">{values[0]?.name}</Descriptions.Item>
        <Descriptions.Item label="E-mail">{values[0]?.email}</Descriptions.Item>
        <Descriptions.Item label="Telefone">{values[0]?.phone}</Descriptions.Item>
        <Descriptions.Item label="Data de Nascimento">{values[0]?.birthdate.format('DD/MM/YYYY')}</Descriptions.Item>
        <Descriptions.Item label="CPF">{values[0]?.cpf}</Descriptions.Item>
        <Descriptions.Item label="CNPJ">{values[0]?.cnpj}</Descriptions.Item>
      </Descriptions>

      <Divider />

      <Descriptions title="Serviços" layout="vertical" size="small" column={1}>
        {values[1]?.services?.map((it) => (
          <Descriptions.Item key={it.key}>
            <Descriptions layout="vertical" size="small" column={3}>
              <Descriptions.Item key={it.key} label="Serviço">
                {it.name}
              </Descriptions.Item>
              <Descriptions.Item label="Preço">{renderMoney(it.price)}</Descriptions.Item>
              <Descriptions.Item label="Duração">{renderDuration(it.duration)}</Descriptions.Item>
            </Descriptions>
          </Descriptions.Item>
        ))}
      </Descriptions>

      <FormX.NextPrevious
        nextText={editing ? 'Atualizar' : 'Criar'}
        onClickNext={onClickSave}
        onClickPrevious={onClickPrevious}
      />
    </div>
  )
}

export type FormSpecialistProps = {
  record?: Specialist | null
  specializations?: SpecialistSpecialization[]
  services: ServicesGroup[]
  onSubmit: (values: FormSpecialistValues) => void
  onClose: () => void
}

function FormSpecialist({ record, specializations, services: groups, onSubmit, onClose }: FormSpecialistProps) {
  const [step, setStep] = useState(INITIAL_STEP)
  const [values, setValues] = useState<StepsValues>(() => prepareInitialValues(record, specializations))
  const editing = !!record

  return (
    <div>
      <FormX.Header title={editing ? 'Editar' : 'Criar'} onClose={onClose} />

      <FormX.Container>
        <Steps
          progressDot
          current={step}
          items={[{ title: 'Dados Pessoais' }, { title: 'Serviços' }, { title: 'Concluir' }]}
        />
        <Divider />
        <Step1
          editing={editing}
          show={step === 0}
          initialValues={values[0]}
          onClickNext={(values) => {
            setValues((prev) => [values, prev[1]])
            setStep(1)
          }}
        />
        <Step2
          editing={editing}
          show={step === 1}
          groups={groups}
          onClickPrevious={() => setStep(0)}
          initialValues={values[1]}
          onClickNext={(values) => {
            setValues((prev) => [prev[0], values])
            setStep(2)
          }}
        />
        <Step3
          editing={editing}
          show={step === 2}
          values={values}
          onClickPrevious={() => {
            setStep(1)
          }}
          onClickSave={() => {
            if (values[0] && values[1]) {
              onSubmit({
                ...values[0],
                services: !values[1]?.services
                  ? []
                  : values[1].services.map((it) => ({
                      serviceId: it.key,
                      price: it.price,
                      duration: it.duration,
                    })),
              })
            }
          }}
        />
      </FormX.Container>
    </div>
  )
}

function prepareInitialValues(record?: Specialist | null, specializations?: SpecialistSpecialization[]): StepsValues {
  if (!record || !specializations) return [undefined, undefined]
  return [
    {
      name: record.name,
      email: record.email,
      birthdate: dayjs(record.birthdate),
      cpf: normalizeCPF(record.cpf),
      cnpj: normalizeCNPJ(record.cnpj),
      phone: normalizePhone(record.phone),
    },
    {
      services: specializations.flatMap((s) =>
        s.services.map((it) => ({
          key: it.serviceNameId,
          name: it.serviceName,
          price: it.price,
          duration: it.duration,
        })),
      ),
    },
  ]
}

export default FormSpecialist
