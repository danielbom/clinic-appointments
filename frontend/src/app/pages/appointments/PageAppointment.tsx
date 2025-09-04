import type { PageMode, ChangePageMode } from '../../../components/AdminX/types'
import useDisclosure from '../../../hooks/useDisclosure'
import ConfirmDeleteModal from '../../../components/ConfirmDeleteModal'

import type { Appointment } from '../../../components/app/pages/appointments/types'

import CalendarAppointmentImpl from './CalendarAppointmentImpl'

import DeleteAppointment from '../../../components/app/pages/appointments/DeleteAppointment'
import FilterAppointment, { FilterAppointmentProps } from '../../../components/app/pages/appointments/FilterAppointment'
import TableAppointment, { TableAppointmentProps } from '../../../components/app/pages/appointments/TableAppointment'
import FormAppointment, { FormAppointmentProps } from '../../../components/app/pages/appointments/FormAppointment'
import ShowAppointment, { ShowAppointmentProps } from '../../../components/app/pages/appointments/ShowAppointment'

import FilterCustomer, {
  FilterCustomerProps,
} from '../../../components/app/pages/customers/FilterCustomer' /* Keep sync */
import FilterService, { FilterServiceProps } from '../../../components/app/pages/services/FilterService' /* Keep sync */

type PageAppointmentProps = {
  view: 'table' | 'calendar'

  mode: PageMode
  changeMode: ChangePageMode

  record: ShowAppointmentProps['record']
  changeRecord: (record: Appointment) => void

  data: TableAppointmentProps['data']
  total: TableAppointmentProps['total']
  pagination: TableAppointmentProps['pagination']
  selectedItems: TableAppointmentProps['selectedItems']
  changeSelectedItems: TableAppointmentProps['changeSelectedItems']

  onClickFilter: FilterAppointmentProps['onSubmit']
  onClickFilterService: FilterServiceProps['onSubmit']
  onClickFilterCustomer: FilterCustomerProps['onSubmit']

  services: FormAppointmentProps['services']
  customers: FormAppointmentProps['customers']
  onCreateAppointment: FormAppointmentProps['onSubmit']
  onUpdateAppointment: FormAppointmentProps['onSubmit']

  onDeleteAppointment: (record: Appointment) => void
  onClickDeleteAll: () => void

  onRecreateAppointment: () => void
}

function PageAppointment({
  view,
  data,
  total,
  pagination,
  selectedItems,
  changeSelectedItems,
  mode,
  changeMode,
  record,
  changeRecord,
  customers,
  services,
  onClickFilter,
  onClickFilterCustomer,
  onClickFilterService,
  onClickDeleteAll,
  onCreateAppointment,
  onUpdateAppointment,
  onDeleteAppointment,
  onRecreateAppointment,
}: PageAppointmentProps) {
  const showModal = useDisclosure(mode !== 'edit' && !!record)
  const filterModal = useDisclosure()
  const deleteModal = useDisclosure()
  const filterServiceModal = useDisclosure()
  const filterCustomerModal = useDisclosure()

  function deleteRecord(record: Appointment) {
    ConfirmDeleteModal({
      onOk: () => {
        onDeleteAppointment(record)
        showModal.onClose()
      },
    })
  }

  function renderContent() {
    switch (mode) {
      case 'list':
        if (view === 'calendar') {
          return <CalendarAppointmentImpl onClickTable={() => changeMode('list', { view: 'table' })} />
        }
        return (
          <TableAppointment
            data={data}
            total={total}
            pagination={pagination}
            selectedItems={selectedItems}
            changeSelectedItems={changeSelectedItems}
            onClickCreate={() => changeMode('create')}
            onClickCalendar={() => changeMode('list', { view: 'calendar' })}
            onClickDeleteAll={deleteModal.onOpen}
            onClickFilter={filterModal.onOpen}
            onClickOptions={(event, record) => {
              switch (event) {
                case 'show':
                  changeRecord(record)
                  changeMode(mode, { id: record.id })
                  showModal.onOpen()
                  break
                case 'edit':
                  changeRecord(record)
                  changeMode('edit', { id: record.id })
                  break
                case 'delete':
                  deleteRecord(record)
                  break
              }
            }}
          />
        )
      case 'create':
        return (
          <FormAppointment
            customers={customers}
            services={services}
            onClickSearchCustomer={filterCustomerModal.onOpen}
            onClickSearchService={filterServiceModal.onOpen}
            onSubmit={onCreateAppointment}
            onClose={() => changeMode('list')}
          />
        )
      case 'edit':
        if (!record) return null
        return (
          <FormAppointment
            record={record}
            onClickSearchCustomer={filterCustomerModal.onOpen}
            onClickSearchService={filterServiceModal.onOpen}
            customers={customers}
            services={services}
            onSubmit={onUpdateAppointment}
            onClose={() => changeMode('list')}
          />
        )
    }
    throw new Error('Invalid mode')
  }

  return (
    <>
      {renderContent()}

      <FilterCustomer
        isSearch
        isOpen={filterCustomerModal.isOpen}
        onClose={filterCustomerModal.onClose}
        onSubmit={onClickFilterCustomer}
      />
      <FilterService
        isSearch
        isOpen={filterServiceModal.isOpen}
        onClose={filterServiceModal.onClose}
        onSubmit={onClickFilterService}
      />
      <FilterAppointment isOpen={filterModal.isOpen} onClose={filterModal.onClose} onSubmit={onClickFilter} />
      <DeleteAppointment
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.onClose}
        onClickDelete={() => {
          onClickDeleteAll()
          deleteModal.onClose()
        }}
        records={selectedItems}
      />
      <ShowAppointment
        isOpen={!!record && showModal.isOpen}
        onClose={() => {
          showModal.onClose()
          changeMode(mode, {})
        }}
        onClickEdit={() => {
          if (!record) return console.warn('Record is undefined')
          showModal.onClose()
          changeMode('edit', { id: record.id })
        }}
        onClickDelete={() => {
          if (!record) return console.warn('Record is undefined')
          deleteRecord(record)
        }}
        onRecreateAppointment={onRecreateAppointment}
        record={record}
      />
    </>
  )
}

export default PageAppointment
