import { Form, Input } from 'antd'

import FilterX from '../../../components/FilterX'

export type FilterServiceValues = {
  service?: string
  specialization?: string
  specialist?: string
}

export type FilterServiceProps = {
  isSearch?: boolean
  isOpen: boolean
  onClose: () => void
  onSubmit: (values: FilterServiceValues) => void
}

function FilterService({ isSearch, isOpen, onClose, onSubmit }: FilterServiceProps) {
  const [form] = Form.useForm()
  return (
    <FilterX.Drawer
      title={isSearch ? 'Procurar serviço' : 'Filtrar'}
      isOpen={isOpen}
      onClose={onClose}
      onClickApply={() => form.validateFields().then(onSubmit)}
      onClickReset={() => form.resetFields()}
    >
      <Form form={form} layout="vertical" validateTrigger={['onBlur']}>
        <Form.Item<FilterServiceValues> label="Especialista" name="specialist">
          <Input />
        </Form.Item>
        <Form.Item<FilterServiceValues> label="Especialização" name="specialization">
          <Input />
        </Form.Item>
        <Form.Item<FilterServiceValues> label="Serviço" name="service">
          <Input />
        </Form.Item>
      </Form>
    </FilterX.Drawer>
  )
}

export default FilterService
