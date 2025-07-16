import { Descriptions } from 'antd'

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
  return (
    <ShowX.Drawer isOpen={isOpen} onClose={onClose} onClickDelete={onClickDelete} onClickEdit={onClickEdit}>
      {record && (
        <Descriptions column={1} layout="vertical" size="small">
          <Descriptions.Item label="ID">{record.id}</Descriptions.Item>
          <Descriptions.Item label="Nome">{record.serviceName}</Descriptions.Item>
        </Descriptions>
      )}
    </ShowX.Drawer>
  )
}

export default ShowService
