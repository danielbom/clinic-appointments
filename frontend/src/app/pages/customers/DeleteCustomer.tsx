import type { Customer } from './types'

import DeleteX from '../../../components/DeleteX'

export type DeleteCustomerProps = {
  records: Customer[]
  isOpen: boolean
  onClose: () => void
  onClickDelete: () => void
}

function DeleteCustomer({ isOpen, onClickDelete, onClose, records }: DeleteCustomerProps) {
  return (
    <DeleteX.Drawer isOpen={isOpen} onClose={onClose} onClickDelete={onClickDelete} recordsCount={records.length}>
      <DeleteX.List records={records.map((it) => ({ id: it.id, content: it.name }))} />
    </DeleteX.Drawer>
  )
}

export default DeleteCustomer
