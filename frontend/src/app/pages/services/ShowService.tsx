import { useNavigate } from 'react-router-dom'
import { Button, Descriptions } from 'antd'
import { CalendarOutlined } from '@ant-design/icons'

import { CREATE_APPOINTMENTS_DATA_KEY } from '../../../lib/keys'
import ShowX from '../../../components/ShowX'

import type { Service } from './types'

export type ShowServiceProps = {
  isOpen: boolean
  onClose: () => void
  onClickEdit: () => void
  onClickDelete: () => void
  record: Service | null
}

function ShowService({ isOpen, onClose, onClickDelete, onClickEdit, record }: ShowServiceProps) {
  const navigate = useNavigate()

  function onCreateAppointment() {
    if (record?.id) {
      sessionStorage.setItem(CREATE_APPOINTMENTS_DATA_KEY, JSON.stringify({ serviceId: record.id }))
      navigate('/_move?key=appointments&mode=create')
    }
  }

  return (
    <ShowX.Drawer isOpen={isOpen} onClose={onClose} onClickDelete={onClickDelete} onClickEdit={onClickEdit}>
      {record && (
        <Descriptions column={1} layout="vertical" size="small">
          <Descriptions.Item label="ID">{record.id}</Descriptions.Item>
          <Descriptions.Item label="Nome">{record.serviceName}</Descriptions.Item>
        </Descriptions>
      )}
      <Button icon={<CalendarOutlined />} onClick={onCreateAppointment} type="primary" style={{ marginTop: '8px' }}>
        Criar Agendamento
      </Button>
    </ShowX.Drawer>
  )
}

export default ShowService
