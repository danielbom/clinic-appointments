import type { Secretary } from './types'

import DeleteX from '../../../DeleteX'

export type DeleteSecretaryProps = {
  records: Secretary[]
  isOpen: boolean
  onClose: () => void
  onClickDelete: () => void
}

function DeleteSecretary({ isOpen, onClickDelete, onClose, records }: DeleteSecretaryProps) {
  return (
    <DeleteX.Drawer isOpen={isOpen} onClose={onClose} onClickDelete={onClickDelete} recordsCount={records.length}>
      <DeleteX.List records={records.map((it) => ({ id: it.id, content: it.name }))} />
    </DeleteX.Drawer>
  )
}

export default DeleteSecretary
