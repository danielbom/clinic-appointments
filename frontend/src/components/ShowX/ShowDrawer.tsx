import { Button, Drawer, Typography } from 'antd'
import { CloseOutlined } from '@ant-design/icons'

import './ShowDrawer.css'
import ShowButtons from './ShowButtons'

type ShowDrawerProps = {
  isOpen: boolean
  onClose: () => void
  onClickEdit: () => void
  onClickDelete: () => void
  children?: React.ReactNode
}

function ShowDrawer({ isOpen, onClose, onClickEdit, onClickDelete, children }: ShowDrawerProps) {
  return (
    <Drawer
      className="show-content"
      maskClassName="show-mask"
      mask
      title={
        <Typography.Title level={3} className="show-title">
          Ver
        </Typography.Title>
      }
      placement="right"
      closable={false}
      onClose={onClose}
      open={isOpen}
      extra={<Button className="show-close" onClick={onClose} icon={<CloseOutlined />} />}
    >
      <ShowButtons onClickDelete={onClickDelete} onClickEdit={onClickEdit} />
      {children}
    </Drawer>
  )
}

export default ShowDrawer
