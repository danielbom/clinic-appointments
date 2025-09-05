import './FormHeader.css'
import { CloseOutlined } from '@ant-design/icons'
import { Button } from 'antd'

interface FormHeaderProps {
  title: string
  onClose: () => void
}

function FormHeader({ title, onClose }: FormHeaderProps) {
  return (
    <div className="form-header">
      <h1>{title}</h1>
      <Button type="text" className="drawer-close" onClick={onClose} icon={<CloseOutlined />} />
    </div>
  )
}

export default FormHeader
