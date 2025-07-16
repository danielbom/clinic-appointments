import { Descriptions, List, Typography } from 'antd'

import ShowX from '../../../components/ShowX'

import type { Specialization } from './types'

export type ShowSpecializationProps = {
  isOpen: boolean
  onClose: () => void
  onClickEdit: () => void
  onClickDelete: () => void
  record: Specialization | null
}

function ShowSpecialization({ isOpen, onClose, onClickDelete, onClickEdit, record }: ShowSpecializationProps) {
  return (
    <ShowX.Drawer isOpen={isOpen} onClose={onClose} onClickDelete={onClickDelete} onClickEdit={onClickEdit}>
      {record && (
        <>
          <Descriptions column={1} layout="vertical" size="small">
            <Descriptions.Item label="ID">{record.id}</Descriptions.Item>
            <Descriptions.Item label="Nome">{record.name}</Descriptions.Item>
          </Descriptions>
          <List
            header={<Typography.Title level={5} children="Services" />}
            size="small"
            dataSource={record.services}
            renderItem={(it) => <List.Item key={it.id}>{it.name}</List.Item>}
          />
        </>
      )}
    </ShowX.Drawer>
  )
}

export default ShowSpecialization
