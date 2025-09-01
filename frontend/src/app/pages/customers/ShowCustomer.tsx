import { useNavigate } from 'react-router-dom'
import { Button, Descriptions } from 'antd'
import { CalendarOutlined } from '@ant-design/icons'

import { CREATE_APPOINTMENTS_DATA_KEY } from '../../../lib/keys'
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
  record: Customer | null
}

function ShowCustomer({ isOpen, onClose, onClickDelete, onClickEdit, record }: ShowCustomerProps) {
  const navigate = useNavigate()

  function onCreateAppointment() {
    if (record?.id) {
      sessionStorage.setItem(CREATE_APPOINTMENTS_DATA_KEY, JSON.stringify({ customerId: record.id }))
      navigate('/_move?key=appointments&mode=create')
    }
  }

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
      <Button icon={<CalendarOutlined />} onClick={onCreateAppointment} type="primary" style={{ marginTop: '8px' }}>
        Criar Agendamento
      </Button>
    </ShowX.Drawer>
  )
}

export default ShowCustomer
