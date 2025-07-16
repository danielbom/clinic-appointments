import { Table, TableColumnType } from 'antd'

import TableX from '../../../../components/TableX'

import type { ServiceAvailable } from '../types'
import { TableServiceAvailableProps } from './index'

const columns: TableColumnType<ServiceAvailable>[] = [
  {
    title: 'Nome',
    dataIndex: 'name',
  },
  {
    title: 'Especialização',
    dataIndex: 'specialization',
  },
]

export default function TableServiceAvailableAsTable({
  data,
  total,
  pagination,
  selectedItems,
  changeSelectedItems,
  onClickOptions,
  onClickCreate,
  onClickDeleteAll,
}: TableServiceAvailableProps) {
  return (
    <>
      <TableX.Header
        title="Clientes"
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
