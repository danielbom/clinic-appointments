import type { PageMode, ChangePageMode } from '../../../components/AdminX/types'
import useDisclosure from '../../../hooks/useDisclosure'
import ConfirmDeleteModal from '../../../components/ConfirmDeleteModal'

import type { Customer } from './types'

import DeleteCustomer, { DeleteCustomerProps } from './DeleteCustomer'
import FilterCustomer, { FilterCustomerProps } from './FilterCustomer'
import TableCustomer, { TableCustomerProps } from './TableCustomer'
import FormCustomer, { FormCustomerProps } from './FormCustomer'
import ShowCustomer, { ShowCustomerProps } from './ShowCustomer'

type PageCustomerProps = {
  mode: PageMode
  changeMode: ChangePageMode

  record: ShowCustomerProps['record']
  changeRecord: (record: Customer) => void

  data: TableCustomerProps['data']
  total: TableCustomerProps['total']
  loading: TableCustomerProps['loading']
  pagination: TableCustomerProps['pagination']
  selectedItems: TableCustomerProps['selectedItems']
  changeSelectedItems: TableCustomerProps['changeSelectedItems']

  onClickFilter: FilterCustomerProps['onSubmit']

  onUpdateCustomer: FormCustomerProps['onSubmit']
  onCreateCustomer: FormCustomerProps['onSubmit']

  onDeleteCustomer: (record: Customer) => void
  onClickDeleteAll: DeleteCustomerProps['onClickDelete']
}

function PageCustomer({
  loading,
  data,
  total,
  pagination,
  selectedItems,
  changeSelectedItems,
  mode,
  changeMode,
  record,
  changeRecord,
  onClickFilter,
  onClickDeleteAll,
  onCreateCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
}: PageCustomerProps) {
  const showModal = useDisclosure(mode !== 'edit' && !!record)
  const filterModal = useDisclosure()
  const deleteModal = useDisclosure()

  function deleteRecord(record: Customer) {
    ConfirmDeleteModal({
      onOk: () => {
        onDeleteCustomer(record)
        showModal.onClose()
      },
    })
  }

  function renderContent() {
    switch (mode) {
      case 'list':
        return (
          <TableCustomer
            data={data}
            total={total}
            loading={loading}
            pagination={pagination}
            selectedItems={selectedItems}
            changeSelectedItems={changeSelectedItems}
            onClickCreate={() => changeMode('create')}
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
        return <FormCustomer onSubmit={onCreateCustomer} onClose={() => changeMode('list')} />
      case 'edit':
        if (!record) return null
        return <FormCustomer record={record} onSubmit={onUpdateCustomer} onClose={() => changeMode('list')} />
    }
    throw new Error('Invalid mode')
  }

  return (
    <>
      {renderContent()}

      <FilterCustomer isOpen={filterModal.isOpen} onClose={filterModal.onClose} onSubmit={onClickFilter} />
      <DeleteCustomer
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.onClose}
        onClickDelete={() => {
          onClickDeleteAll()
          deleteModal.onClose()
        }}
        records={selectedItems}
      />
      <ShowCustomer
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
        record={record}
      />
    </>
  )
}

export default PageCustomer
