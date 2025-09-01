import { Button, Descriptions } from 'antd'
import { CalendarOutlined } from '@ant-design/icons'

import ShowX from '../../../components/ShowX'

import type { Customer } from './types'

import normalizePhone from '../../../lib/normalizers/normalizePhone'
import renderDate from '../../../lib/renders/renderDate'
import normalizeCPF from '../../../lib/normalizers/normalizeCPF'
import renderAge from '../../../lib/renders/rendertAge'

export type ShowCustomerProps = {
  isOpen: boolean
  onClose: () => void
  onClickEdit: () => void
  onClickDelete: () => void
  onReceateAppointment: () => void
  record: Customer | null
}

function ShowCustomer({ isOpen, onClose, onClickDelete, onClickEdit, onReceateAppointment, record }: ShowCustomerProps) {
  return (
    <ShowX.Drawer isOpen={isOpen} onClose={onClose} onClickDelete={onClickDelete} onClickEdit={onClickEdit}>
      {record && (
        <Descriptions column={1} layout="vertical" size="small">
          <Descriptions.Item label="ID">{record.id}</Descriptions.Item>
          <Descriptions.Item label="Nome">{record.name}</Descriptions.Item>
          <Descriptions.Item label="E-mail">{record.email}</Descriptions.Item>
          <Descriptions.Item label="CPF">{normalizeCPF(record.cpf)}</Descriptions.Item>
          <Descriptions.Item label="Telefone">{normalizePhone(record.phone)}</Descriptions.Item>
          <Descriptions.Item label="Data de Nascimento">{renderDate(record.birthdate)}</Descriptions.Item>
          <Descriptions.Item label="Idade">{renderAge(record.birthdate)}</Descriptions.Item>
        </Descriptions>
      )}
      <Button icon={<CalendarOutlined />} onClick={onReceateAppointment} type="primary" style={{ marginTop: '8px' }}>
        Criar Agendamento
      </Button>
    </ShowX.Drawer>
  )
}

export default ShowCustomer
