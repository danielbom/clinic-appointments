import { Button, Drawer, Typography } from 'antd'
import { CloseOutlined } from '@ant-design/icons'

import './DeleteDrawer.css'

interface DeleteDrawerProps {
  isOpen: boolean
  onClose: () => void
  onClickDelete: () => void
  recordsCount: number
  children?: React.ReactNode
}

function DeleteDrawer({ isOpen, onClose, children, recordsCount, onClickDelete }: DeleteDrawerProps) {
  return (
    <Drawer
      className="drawer-content"
      maskClassName="drawer-mask"
      mask
      title={
        <Typography.Title level={3} className="drawer-title">
          Deletar todos
        </Typography.Title>
      }
      placement="right"
      closable={false}
      onClose={onClose}
      open={isOpen}
      extra={<Button className="drawer-close" onClick={onClose} icon={<CloseOutlined />} />}
      footer={
        <div className="drawer-footer">
          <Button onClick={onClickDelete} type="primary">
            Confirme a remoção de {recordsCount} registros
          </Button>
        </div>
      }
    >
      {children}
    </Drawer>
  )
}

export default DeleteDrawer
