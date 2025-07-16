import type { ChangePageMode, PageMode } from '../../../components/AdminX/types'
import useDisclosure from '../../../hooks/useDisclosure'
import ConfirmDeleteModal from '../../../components/ConfirmDeleteModal'

import type { Service } from './types'
import DeleteService from './DeleteService'
import FilterService, { FilterServiceProps } from './FilterService'
import TableService, { TableServiceProps } from './TableService'
import FormService, { FormServiceProps } from './FormService'
import ShowService, { ShowServiceProps } from './ShowService'
import { DeleteCustomerProps } from '../customers/DeleteCustomer'

type PageServiceProps = {
  mode: PageMode
  changeMode: ChangePageMode

  record: ShowServiceProps['record']
  changeRecord: (record: Service) => void

  data: TableServiceProps['data']
  total: TableServiceProps['total']
  loading: TableServiceProps['loading']
  pagination: TableServiceProps['pagination']
  selectedItems: TableServiceProps['selectedItems']
  changeSelectedItems: TableServiceProps['changeSelectedItems']

  onClickFilter: FilterServiceProps['onSubmit']

  specialists: FormServiceProps['specialists']
  services: FormServiceProps['services']
  onCreateService: FormServiceProps['onSubmit']
  onUpdateService: FormServiceProps['onSubmit']

  onDeleteService: (record: Service) => void
  onClickDeleteAll: DeleteCustomerProps['onClickDelete']
}

function PageService({
  data,
  total,
  loading,
  pagination,
  selectedItems,
  changeSelectedItems,
  mode,
  changeMode,
  record,
  changeRecord,
  onClickFilter,
  onClickDeleteAll,
  specialists,
  services,
  onCreateService,
  onUpdateService,
  onDeleteService,
}: PageServiceProps) {
  const showModal = useDisclosure()
  const filterModal = useDisclosure()
  const deleteModal = useDisclosure()

  function deleteRecord(record: Service) {
    ConfirmDeleteModal({
      onOk: () => {
        onDeleteService(record)
        showModal.onClose()
      },
    })
  }

  function renderContent() {
    switch (mode) {
      case 'list':
        return (
          <TableService
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
          <FormService
            specialists={specialists}
            services={services}
            onSubmit={onCreateService}
            onClose={() => changeMode('list')}
          />
        )
      case 'edit':
        if (!record) return null
        return (
          <FormService
            record={record}
            specialists={specialists}
            services={services}
            onSubmit={onUpdateService}
            onClose={() => changeMode('list')}
          />
        )
    }
    throw new Error('Invalid mode')
  }

  return (
    <>
      {renderContent()}

      <FilterService isOpen={filterModal.isOpen} onClose={filterModal.onClose} onSubmit={onClickFilter} />
      <DeleteService
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.onClose}
        onClickDelete={() => {
          onClickDeleteAll()
          deleteModal.onClose()
        }}
        records={selectedItems}
      />
      <ShowService
        isOpen={!!record && showModal.isOpen}
        onClose={showModal.onClose}
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

export default PageService
