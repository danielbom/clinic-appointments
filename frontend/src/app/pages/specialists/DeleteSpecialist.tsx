import type { Specialist } from './types'

import DeleteX from '../../../components/DeleteX'

export type DeleteSpecialistProps = {
  records: Specialist[]
  isOpen: boolean
  onClose: () => void
  onClickDelete: () => void
}

function DeleteSpecialist({ isOpen, onClickDelete, onClose, records }: DeleteSpecialistProps) {
  return (
    <DeleteX.Drawer isOpen={isOpen} onClose={onClose} onClickDelete={onClickDelete} recordsCount={records.length}>
      <DeleteX.List records={records.map((it) => ({ id: it.id, content: it.name }))} />
    </DeleteX.Drawer>
  )
}

export default DeleteSpecialist
