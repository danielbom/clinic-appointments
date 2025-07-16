import { Descriptions } from 'antd'

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
    </ShowX.Drawer>
  )
}

export default ShowAppointment
