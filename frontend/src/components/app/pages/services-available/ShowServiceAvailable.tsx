import { Descriptions } from 'antd'

import ShowX from '../../../ShowX'

import type { ServiceAvailable } from './types'

export type ShowServiceAvailableProps = {
  isOpen: boolean
  onClose: () => void
  onClickEdit: () => void
  onClickDelete: () => void
  record: ServiceAvailable | null
}

function ShowServiceAvailable({ isOpen, onClose, onClickDelete, onClickEdit, record }: ShowServiceAvailableProps) {
  return (
    <ShowX.Drawer isOpen={isOpen} onClose={onClose} onClickDelete={onClickDelete} onClickEdit={onClickEdit}>
      {record && (
        <Descriptions column={1} layout="vertical" size="small">
          <Descriptions.Item label="ID">{record.id}</Descriptions.Item>
          <Descriptions.Item label="Nome">{record.name}</Descriptions.Item>
          <Descriptions.Item label="Especialização">{record.specialization}</Descriptions.Item>
        </Descriptions>
      )}
    </ShowX.Drawer>
  )
}

export default ShowServiceAvailable
