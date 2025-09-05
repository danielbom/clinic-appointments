import type { Service } from './types'

import DeleteX from '../../../DeleteX'

export interface DeleteServiceProps {
  records: Service[]
  isOpen: boolean
  onClose: () => void
  onClickDelete: () => void
}

function DeleteService({ isOpen, onClickDelete, onClose, records }: DeleteServiceProps) {
  return (
    <DeleteX.Drawer isOpen={isOpen} onClose={onClose} onClickDelete={onClickDelete} recordsCount={records.length}>
      <DeleteX.List
        records={records.map((it) => ({ id: it.id, content: `"${it.serviceName}" feita por "${it.specialistName}"` }))}
      />
    </DeleteX.Drawer>
  )
}

export default DeleteService
