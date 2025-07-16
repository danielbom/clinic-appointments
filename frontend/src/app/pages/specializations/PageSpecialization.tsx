import type { ChangePageMode, PageMode } from '../../../components/AdminX/types'
import useDisclosure from '../../../hooks/useDisclosure'
import ConfirmDeleteModal from '../../../components/ConfirmDeleteModal'

import { Specialization } from './types'

import DeleteSpecialization, { DeleteSpecializationProps } from './DeleteSpecialization'
import TableSpecialization, { TableSpecializationProps } from './TableSpecialization'
import ShowSpecialization, { ShowSpecializationProps } from './ShowSpecialization'
import FormSpecialization, { FormSpecializationProps } from './FormSpecialization'

export type PageSpecializationProps = {
  mode: PageMode
  changeMode: ChangePageMode

  record: ShowSpecializationProps['record']
  changeRecord: (record: Specialization) => void

  data: TableSpecializationProps['data']
  total: TableSpecializationProps['total']
  loading: TableSpecializationProps['loading']
  pagination: TableSpecializationProps['pagination']
  selectedItems: TableSpecializationProps['selectedItems']
  changeSelectedItems: TableSpecializationProps['changeSelectedItems']

  onUpdateSpecialization: FormSpecializationProps['onSubmit']
  onCreateSpecialization: FormSpecializationProps['onSubmit']

  onDeleteSpecialization: (record: Specialization) => void
  onClickDeleteAll: DeleteSpecializationProps['onClickDelete']
}

function PageSpecialization({
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
  onUpdateSpecialization,
  onCreateSpecialization,
  onDeleteSpecialization,
  onClickDeleteAll,
}: PageSpecializationProps) {
  const showModal = useDisclosure()
  const deleteModal = useDisclosure()

  function deleteRecord(record: Specialization) {
    ConfirmDeleteModal({
      onOk: () => {
        onDeleteSpecialization(record)
        showModal.onClose()
      },
    })
  }

  function renderContent() {
    switch (mode) {
      case 'list':
        return (
          <TableSpecialization
            loading={loading}
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
        return <FormSpecialization onSubmit={onCreateSpecialization} onClose={() => changeMode('list')} />
      case 'edit':
        if (!record) return null
        return (
          <FormSpecialization record={record} onSubmit={onUpdateSpecialization} onClose={() => changeMode('list')} />
        )
    }
    throw new Error('Invalid mode')
  }

  return (
    <>
      {renderContent()}

      <DeleteSpecialization
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.onClose}
        onClickDelete={() => {
          onClickDeleteAll()
          deleteModal.onClose()
        }}
        records={selectedItems}
      />
      <ShowSpecialization
        isOpen={showModal.isOpen}
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

export default PageSpecialization
