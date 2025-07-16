import { DeleteOutlined } from '@ant-design/icons'
import { Modal, ModalFuncProps } from 'antd'

type ConfirmDeleteModalProps = ModalFuncProps

function ConfirmDeleteModal(props: ConfirmDeleteModalProps) {
  return Modal.confirm({
    ...props,
    className: 'actions-menu-modal',
    title: 'Você realmente deseja remover este item?',
    icon: <DeleteOutlined />,
    okType: 'danger',
    closable: true,
  })
}

export default ConfirmDeleteModal
