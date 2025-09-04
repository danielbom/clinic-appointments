import type { ServiceAvailable } from './types'

import DeleteX from '../../../DeleteX'

export type DeleteServiceAvailableProps = {
  records: ServiceAvailable[]
  isOpen: boolean
  onClose: () => void
  onClickDelete: () => void
}

function DeleteServiceAvailable({ isOpen, onClickDelete, onClose, records }: DeleteServiceAvailableProps) {
  return (
    <DeleteX.Drawer isOpen={isOpen} onClose={onClose} onClickDelete={onClickDelete} recordsCount={records.length}>
      <DeleteX.List records={records.map((it) => ({ id: it.id, content: it.name }))} />
    </DeleteX.Drawer>
  )
}

export default DeleteServiceAvailable
