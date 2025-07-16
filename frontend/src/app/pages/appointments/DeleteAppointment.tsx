import type { Appointment } from './types'

import DeleteX from '../../../components/DeleteX'
import renderDateHour from '../../../lib/renders/renderDateHour'

export type DeleteAppointmentProps = {
  records: Appointment[]
  isOpen: boolean
  onClose: () => void
  onClickDelete: () => void
}

function DeleteAppointment({ isOpen, onClickDelete, onClose, records }: DeleteAppointmentProps) {
  return (
    <DeleteX.Drawer isOpen={isOpen} onClose={onClose} onClickDelete={onClickDelete} recordsCount={records.length}>
      <DeleteX.List
        records={records.map((it) => ({
          id: it.id,
          content: renderDateHour(it.date, it.time) + ' - ' + it.serviceName,
        }))}
      />
    </DeleteX.Drawer>
  )
}

export default DeleteAppointment
