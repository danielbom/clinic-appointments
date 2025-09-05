import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import './ShowButtons.css'

interface ShowButtonsProps {
  onClickEdit: () => void
  onClickDelete: () => void
}

export default function ShowButtons({ onClickEdit, onClickDelete }: ShowButtonsProps) {
  return (
    <div className="show-buttons">
      <Button icon={<EditOutlined />} onClick={onClickEdit} type="primary">
        Editar
      </Button>
      <Button icon={<DeleteOutlined />} onClick={onClickDelete} danger>
        Deletar
      </Button>
    </div>
  )
}
