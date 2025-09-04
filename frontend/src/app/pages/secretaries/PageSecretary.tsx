import type { PageMode, ChangePageMode } from '../../../components/AdminX/types'
import ConfirmDeleteModal from '../../../components/ConfirmDeleteModal'
import useDisclosure from '../../../hooks/useDisclosure'

import type { Secretary } from '../../../components/app/pages/secretaries/types'

import DeleteSecretary, { DeleteSecretaryProps } from '../../../components/app/pages/secretaries/DeleteSecretary'
import FilterSecretary, { FilterSecretaryProps } from '../../../components/app/pages/secretaries/FilterSecretary'
import TableSecretary, { TableSecretaryProps } from '../../../components/app/pages/secretaries/TableSecretary'
import FormSecretary, { FormSecretaryProps } from '../../../components/app/pages/secretaries/FormSecretary'
import ShowSecretary, { ShowSecretaryProps } from '../../../components/app/pages/secretaries/ShowSecretary'

type PageSecretaryProps = {
  mode: PageMode
  changeMode: ChangePageMode

  record: ShowSecretaryProps['record']
  changeRecord: (record: Secretary) => void

  data: TableSecretaryProps['data']
  total: TableSecretaryProps['total']
  loading: TableSecretaryProps['loading']
  pagination: TableSecretaryProps['pagination']
  selectedItems: TableSecretaryProps['selectedItems']
  changeSelectedItems: TableSecretaryProps['changeSelectedItems']

  onClickFilter: FilterSecretaryProps['onSubmit']

  onUpdateSecretary: FormSecretaryProps['onSubmit']
  onCreateSecretary: FormSecretaryProps['onSubmit']

  onDeleteSecretary: (record: Secretary) => void
  onClickDeleteAll: DeleteSecretaryProps['onClickDelete']
}

function PageSecretary({
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
  onCreateSecretary,
  onUpdateSecretary,
  onDeleteSecretary,
}: PageSecretaryProps) {
  const showModal = useDisclosure(mode !== 'edit' && !!record)
  const filterModal = useDisclosure()
  const deleteModal = useDisclosure()

  function deleteRecord(record: Secretary) {
    ConfirmDeleteModal({
      onOk: () => {
        onDeleteSecretary(record)
        showModal.onClose()
      },
    })
  }

  function renderContent() {
    switch (mode) {
      case 'list':
        return (
          <TableSecretary
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
        return <FormSecretary onSubmit={onCreateSecretary} onClose={() => changeMode('list')} />
      case 'edit':
        if (!record) return null
        return <FormSecretary record={record} onSubmit={onUpdateSecretary} onClose={() => changeMode('list')} />
    }
    throw new Error('Invalid mode')
  }

  return (
    <>
      {renderContent()}

      <FilterSecretary isOpen={filterModal.isOpen} onClose={filterModal.onClose} onSubmit={onClickFilter} />
      <DeleteSecretary
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.onClose}
        onClickDelete={() => {
          onClickDeleteAll()
          deleteModal.onClose()
        }}
        records={selectedItems}
      />
      <ShowSecretary
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

export default PageSecretary
