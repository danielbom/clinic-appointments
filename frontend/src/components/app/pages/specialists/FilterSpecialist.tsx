import { Form, Input } from 'antd'

import FilterX from '../../../FilterX'

import normalizeCPF from '../../../../lib/normalizers/normalizeCPF'
import normalizePhone from '../../../../lib/normalizers/normalizePhone'

import { cpfIsInvalid } from '../../../../lib/rules/cpf'
import { phoneIsInvalid } from '../../../../lib/rules/phone'

export type FilterSpecialistValues = {
  name?: string
  cpf?: string
  phone?: string
}

export type FilterSpecialistProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (values: FilterSpecialistValues) => void
}

function FilterSpecialist({ isOpen, onClose, onSubmit }: FilterSpecialistProps) {
  const [form] = Form.useForm()
  return (
    <FilterX.Drawer
      isOpen={isOpen}
      onClose={onClose}
      onClickApply={() => form.validateFields().then(onSubmit)}
      onClickReset={() => form.resetFields()}
    >
      <Form form={form} layout="vertical" validateTrigger={['onBlur']}>
        <Form.Item<FilterSpecialistValues>
          label="Telefone"
          name="phone"
          normalize={normalizePhone}
          rules={[phoneIsInvalid]}
        >
          <Input />
        </Form.Item>
        <Form.Item<FilterSpecialistValues> label="CPF" name="cpf" normalize={normalizeCPF} rules={[cpfIsInvalid]}>
          <Input />
        </Form.Item>
        <Form.Item<FilterSpecialistValues> label="Nome" name="name">
          <Input />
        </Form.Item>
      </Form>
    </FilterX.Drawer>
  )
}

export default FilterSpecialist
