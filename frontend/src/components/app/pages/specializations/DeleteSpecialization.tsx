import type { Specialization } from './types'

import DeleteX from '../../../DeleteX'

export type DeleteSpecializationProps = {
  records: Specialization[]
  isOpen: boolean
  onClose: () => void
  onClickDelete: () => void
}

function DeleteSpecialization({ isOpen, onClickDelete, onClose, records }: DeleteSpecializationProps) {
  return (
    <DeleteX.Drawer isOpen={isOpen} onClose={onClose} onClickDelete={onClickDelete} recordsCount={records.length}>
      <DeleteX.List records={records.map((it) => ({ id: it.id, content: it.name }))} />
    </DeleteX.Drawer>
  )
}

export default DeleteSpecialization
