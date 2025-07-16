import type { ChangePageMode, PageMode } from '../../../components/AdminX/types'
import useDisclosure from '../../../hooks/useDisclosure'
import ConfirmDeleteModal from '../../../components/ConfirmDeleteModal'

import type { Specialist } from './types'

import DeleteSpecialist, { DeleteSpecialistProps } from './DeleteSpecialist'
import FilterSpecialist, { FilterSpecialistProps } from './FilterSpecialist'
import TableSpecialist, { TableSpecialistProps } from './TableSpecialist'
import FormSpecialist, { FormSpecialistProps } from './FormSpecialist'
import ShowSpecialist, { ShowSpecialistProps } from './ShowSpecialist'

type PageSpecialistProps = {
  mode: PageMode
  changeMode: ChangePageMode

  record: ShowSpecialistProps['record']
  changeRecord: (record: Specialist) => void

  onDeleteRecord: (record: Specialist) => void

  data: TableSpecialistProps['data']
  total: TableSpecialistProps['total']
  loading: TableSpecialistProps['loading']
  pagination: TableSpecialistProps['pagination']
  selectedItems: TableSpecialistProps['selectedItems']
  changeSelectedItems: TableSpecialistProps['changeSelectedItems']

  showTab: ShowSpecialistProps['showTab']
  specializations: ShowSpecialistProps['specializations']
  appointments: ShowSpecialistProps['appointments']
  referenceDay: ShowSpecialistProps['referenceDay']

  services: FormSpecialistProps['services']
  onCreateRecord: FormSpecialistProps['onSubmit']
  onUpdateRecord: FormSpecialistProps['onSubmit']

  onClickFilter: FilterSpecialistProps['onSubmit']

  onClickDeleteAll: DeleteSpecialistProps['onClickDelete']
}

function PageSpecialist({
  record,
  changeRecord,
  showTab,
  specializations,
  appointments,
  referenceDay,
  data,
  total,
  loading,
  pagination,
  selectedItems,
  changeSelectedItems,
  mode,
  changeMode,
  onClickFilter,
  onClickDeleteAll,
  services,
  onCreateRecord,
  onUpdateRecord,
  onDeleteRecord,
}: PageSpecialistProps) {
  const filterModal = useDisclosure()
  const deleteModal = useDisclosure()

  function deleteRecord(record: Specialist) {
    ConfirmDeleteModal({
      onOk: () => {
        onDeleteRecord(record)
      },
    })
  }

  function renderContent() {
    switch (mode) {
      case 'show':
        if (!record) return null
        return (
          <ShowSpecialist
            showTab={showTab}
            onChangeKey={(key) => {
              changeMode('show', { id: record.id, referenceDay, showTab: key })
            }}
            onClickEdit={() => {
              changeMode('edit', { id: record.id })
            }}
            onClickDelete={() => {
              deleteRecord(record)
            }}
            onChangeReferenceDay={(referenceDay) => {
              changeMode('show', { id: record.id, referenceDay, showTab: showTab ?? '1' })
            }}
            record={record}
            specializations={specializations}
            appointments={appointments}
            referenceDay={referenceDay}
          />
        )
      case 'list':
        return (
          <TableSpecialist
            data={data}
            loading={loading}
            total={total}
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
                  changeMode('show', { id: record.id, referenceDay })
                  break
                case 'edit':
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
        return <FormSpecialist onSubmit={onCreateRecord} onClose={() => changeMode('list')} services={services} />
      case 'edit':
        if (!record) return null
        if (!specializations) return null
        return (
          <FormSpecialist
            record={record}
            specializations={specializations}
            services={services}
            onSubmit={onUpdateRecord}
            onClose={() => changeMode('list')}
          />
        )
    }
    throw new Error('Invalid mode')
  }

  return (
    <>
      {renderContent()}

      <FilterSpecialist isOpen={filterModal.isOpen} onClose={filterModal.onClose} onSubmit={onClickFilter} />
      <DeleteSpecialist
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.onClose}
        onClickDelete={() => {
          onClickDeleteAll()
          deleteModal.onClose()
        }}
        records={selectedItems}
      />
    </>
  )
}

export default PageSpecialist
