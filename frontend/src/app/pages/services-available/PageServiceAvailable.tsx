import type { PageMode, ChangePageMode } from '../../../components/AdminX/types'
import useDisclosure from '../../../hooks/useDisclosure'
import ConfirmDeleteModal from '../../../components/ConfirmDeleteModal'

import type { ServiceAvailable } from './types'

import DeleteServiceAvailable, { DeleteServiceAvailableProps } from './DeleteServiceAvailable'
import TableServiceAvailable, { TableServiceAvailableProps } from './TableServiceAvailable'
import FormServiceAvailable, { FormServiceAvailableProps } from './FormServiceAvailable'
import ShowServiceAvailable, { ShowServiceAvailableProps } from './ShowServiceAvailable'

type PageServiceAvailableProps = {
  mode: PageMode
  changeMode: ChangePageMode

  record: ShowServiceAvailableProps['record']
  changeRecord: (record: ServiceAvailable) => void

  data: TableServiceAvailableProps['data']
  total: TableServiceAvailableProps['total']
  pagination: TableServiceAvailableProps['pagination']
  selectedItems: TableServiceAvailableProps['selectedItems']
  changeSelectedItems: TableServiceAvailableProps['changeSelectedItems']

  specializations: FormServiceAvailableProps['specializations']
  onUpdateServiceAvailable: FormServiceAvailableProps['onSubmit']
  onCreateServiceAvailable: FormServiceAvailableProps['onSubmit']

  onDeleteServiceAvailable: (record: ServiceAvailable) => void
  onClickDeleteAll: DeleteServiceAvailableProps['onClickDelete']
}

function PageServiceAvailable({
  data,
  total,
  pagination,
  selectedItems,
  changeSelectedItems,
  mode,
  changeMode,
  record,
  changeRecord,
  specializations,
  onClickDeleteAll,
  onCreateServiceAvailable,
  onUpdateServiceAvailable,
  onDeleteServiceAvailable,
}: PageServiceAvailableProps) {
  const showModal = useDisclosure()
  const deleteModal = useDisclosure()

  function deleteRecord(record: ServiceAvailable) {
    ConfirmDeleteModal({
      onOk: () => {
        onDeleteServiceAvailable(record)
        showModal.onClose()
      },
      content: <p>Deletar um serviço removerá as conexões existentes com ele</p>,
    })
  }

  function renderContent() {
    switch (mode) {
      case 'list':
        return (
          <TableServiceAvailable
            data={data}
            total={total}
            pagination={pagination}
            selectedItems={selectedItems}
            changeSelectedItems={changeSelectedItems}
            onClickCreate={() => changeMode('create')}
            onClickDeleteAll={deleteModal.onOpen}
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
          <FormServiceAvailable
            specializations={specializations}
            onSubmit={onCreateServiceAvailable}
            onClose={() => changeMode('list')}
          />
        )
      case 'edit':
        if (!record) return null
        return (
          <FormServiceAvailable
            record={record}
            specializations={specializations}
            onSubmit={onUpdateServiceAvailable}
            onClose={() => changeMode('list')}
          />
        )
    }
    throw new Error('Invalid mode')
  }

  return (
    <>
      {renderContent()}

      <DeleteServiceAvailable
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.onClose}
        onClickDelete={() => {
          onClickDeleteAll()
          deleteModal.onClose()
        }}
        records={selectedItems}
      />
      <ShowServiceAvailable
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

export default PageServiceAvailable
