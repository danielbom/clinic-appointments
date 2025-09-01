import { useNavigate } from 'react-router-dom'
import { Button, Descriptions, message } from 'antd'
import { CalendarOutlined } from '@ant-design/icons'

import { useApi } from '../../../context/ApiContext'
import { CREATE_APPOINTMENTS_DATA_KEY } from '../../../lib/keys'
import ShowX from '../../../components/ShowX'

import type { Appointment } from './types'
import renderDate from '../../../lib/renders/renderDate'
import renderHour from '../../../lib/renders/renderHour'
import renderDuration from '../../../lib/renders/renderDuration'

export type ShowAppointmentProps = {
  isOpen: boolean
  onClose: () => void
  onClickEdit: () => void
  onClickDelete: () => void
  record: Appointment | null
}

function ShowAppointment({ isOpen, onClose, onClickDelete, onClickEdit, record }: ShowAppointmentProps) {
  const api = useApi()
  const navigate = useNavigate()

  async function onCreateAppointment() {
    if (record?.id) {
      try {
        const service = await api.specialists.getService(record.specialistId, record.serviceNameId)
        const data = JSON.stringify({
          customerId: record.customerId,
          time: record.time,
          serviceId: service.data.id,
        })
        sessionStorage.setItem(CREATE_APPOINTMENTS_DATA_KEY, data)
        navigate('/_move?key=appointments&mode=create')
      } catch (error) {
        message.error('Serviço deste especialista está indisponível')
      }
    }
  }

  return (
    <ShowX.Drawer isOpen={isOpen} onClose={onClose} onClickDelete={onClickDelete} onClickEdit={onClickEdit}>
      {record && (
        <Descriptions column={1} layout="vertical" size="small">
          <Descriptions.Item label="ID">{record.id}</Descriptions.Item>
          <Descriptions.Item label="Cliente">{record.customerName}</Descriptions.Item>
          <Descriptions.Item label="Especialista">{record.specialistName}</Descriptions.Item>
          <Descriptions.Item label="Serviço">{record.serviceName}</Descriptions.Item>
          <Descriptions.Item label="Data">{renderDate(record.date)}</Descriptions.Item>
          <Descriptions.Item label="Hora">{renderHour(record.time)}</Descriptions.Item>
          <Descriptions.Item label="Duração">{renderDuration(record.duration)}</Descriptions.Item>
        </Descriptions>
      )}
      <Button icon={<CalendarOutlined />} onClick={onCreateAppointment} type="primary" style={{ marginTop: '8px' }}>
        Recriar Agendamento
      </Button>
    </ShowX.Drawer>
  )
}

export default ShowAppointment
