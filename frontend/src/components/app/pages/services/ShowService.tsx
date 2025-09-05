import { Button, Descriptions } from 'antd'
import { CalendarOutlined } from '@ant-design/icons'

import ShowX from '../../../ShowX'

import type { Service } from './types'

export interface ShowServiceProps {
  isOpen: boolean
  onClose: () => void
  onClickEdit: () => void
  onClickDelete: () => void
  onReceateAppointment: () => void
  record: Service | null
}

function ShowService({ isOpen, onClose, onClickDelete, onClickEdit, onReceateAppointment, record }: ShowServiceProps) {
  return (
    <ShowX.Drawer isOpen={isOpen} onClose={onClose} onClickDelete={onClickDelete} onClickEdit={onClickEdit}>
      {record && (
        <Descriptions column={1} layout="vertical" size="small">
          <Descriptions.Item label="ID">{record.id}</Descriptions.Item>
          <Descriptions.Item label="Nome">{record.serviceName}</Descriptions.Item>
        </Descriptions>
      )}
      <Button icon={<CalendarOutlined />} onClick={onReceateAppointment} type="primary" style={{ marginTop: '8px' }}>
        Criar Agendamento
      </Button>
    </ShowX.Drawer>
  )
}

export default ShowService
