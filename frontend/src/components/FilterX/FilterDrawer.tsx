import { Button, Drawer, Typography } from 'antd'
import { CloseOutlined } from '@ant-design/icons'

import './FilterDrawer.css'

interface FilterDrawerProps {
  title?: string
  isOpen: boolean
  onClose: () => void
  onClickReset: () => void
  onClickApply: () => void
  children?: React.ReactNode
}

function FilterDrawer({ title, isOpen, onClose, children, onClickApply, onClickReset }: FilterDrawerProps) {
  return (
    <Drawer
      className="drawer-content"
      maskClassName="drawer-mask"
      mask
      title={
        <Typography.Title level={3} className="drawer-title">
          {title ?? 'Filtros'}
        </Typography.Title>
      }
      placement="right"
      closable={false}
      onClose={onClose}
      open={isOpen}
      extra={<Button className="drawer-close" onClick={onClose} icon={<CloseOutlined />} />}
      footer={
        <div className="drawer-footer">
          <Button onClick={onClickApply} type="primary">
            Aplicar
          </Button>
          <Button onClick={onClickReset}>Limpar</Button>
        </div>
      }
    >
      {children}
    </Drawer>
  )
}

export default FilterDrawer
