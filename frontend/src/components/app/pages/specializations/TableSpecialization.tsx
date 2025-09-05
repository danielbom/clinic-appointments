import { Table, TableColumnType, TableProps } from 'antd'

import type { OptionsEvent } from '../../../TableX/TableOptions'
import TableX from '../../../TableX'

import type { Specialization } from './types'

const columns: TableColumnType<Specialization>[] = [
  {
    title: 'Nome',
    dataIndex: 'name',
  },
  {
    title: 'Serviços',
    render: (_, record) => record.services.length,
    align: 'center',
  },
]

export interface TableSpecializationProps {
  data: Specialization[]
  total: number
  loading: boolean
  pagination: TableProps<Specialization>['pagination']
  selectedItems: Specialization[]
  changeSelectedItems: (items: Specialization[]) => void
  onClickOptions: (event: OptionsEvent, record: Specialization) => void
  onClickCreate: () => void
  onClickDeleteAll: () => void
}

const TableSpecialization = ({
  data,
  total,
  pagination,
  selectedItems,
  changeSelectedItems,
  onClickOptions,
  onClickCreate,
  onClickDeleteAll,
}: TableSpecializationProps) => {
  return (
    <>
      <TableX.Header
        title="Especializações"
        count={total}
        selectedCount={selectedItems.length}
        onClickCreate={onClickCreate}
        onClickDeleteAll={onClickDeleteAll}
      />
      <TableX.Container>
        <Table
          rowSelection={{
            type: 'checkbox',
            selectedRowKeys: selectedItems.map((item) => item.id),
            onChange: (_selectedRowKeys, selectedRows) => {
              changeSelectedItems(selectedRows)
            },
          }}
          size="small"
          rowKey={(record) => record.id}
          columns={[...columns, TableX.Options(onClickOptions)]}
          dataSource={data}
          pagination={pagination}
        />
      </TableX.Container>
    </>
  )
}

export default TableSpecialization
