import { Form, Input } from 'antd'

import FilterX from '../../../components/FilterX'

import normalizeCPF from '../../../lib/normalizers/normalizeCPF'
import normalizePhone from '../../../lib/normalizers/normalizePhone'
import { phoneIsInvalid } from '../../../lib/rules/phone'
import { cpfIsInvalid } from '../../../lib/rules/cpf'

export type FilterCustomerValues = {
  name?: string
  cpf?: string
  phone?: string
}

export type FilterCustomerProps = {
  isSearch?: boolean
  isOpen: boolean
  onClose: () => void
  onSubmit: (values: FilterCustomerValues) => void
}

function FilterCustomer({ isSearch, isOpen, onClose, onSubmit }: FilterCustomerProps) {
  const [form] = Form.useForm()
  return (
    <FilterX.Drawer
      title={isSearch ? 'Procurar cliente' : 'Filtrar'}
      isOpen={isOpen}
      onClose={onClose}
      onClickApply={() => form.validateFields().then(onSubmit)}
      onClickReset={() => form.resetFields()}
    >
      <Form form={form} layout="vertical" validateTrigger={['onBlur']}>
        <Form.Item<FilterCustomerValues>
          label="Telefone"
          name="phone"
          normalize={normalizePhone}
          rules={[phoneIsInvalid]}
        >
          <Input />
        </Form.Item>
        <Form.Item<FilterCustomerValues> label="CPF" name="cpf" normalize={normalizeCPF} rules={[cpfIsInvalid]}>
          <Input />
        </Form.Item>
        <Form.Item<FilterCustomerValues> label="Nome" name="name">
          <Input />
        </Form.Item>
      </Form>
    </FilterX.Drawer>
  )
}

export default FilterCustomer
