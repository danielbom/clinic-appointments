import { Table, TableProps, TableColumnType } from 'antd'

import type { OptionsEvent } from '../../../TableX/TableOptions'
import TableX from '../../../TableX'

import type { Service } from './types'
import renderDuration from '../../../../lib/renders/renderDuration'
import renderMoney from '../../../../lib/renders/renderMoney'

const columns: TableColumnType<Service>[] = [
  {
    title: 'Nome',
    dataIndex: 'serviceName',
  },
  {
    title: 'Especialista',
    dataIndex: 'specialistName',
  },
  {
    title: 'Especialização',
    dataIndex: 'specialization',
  },
  {
    title: 'Preço',
    dataIndex: 'price',
    render: (value) => renderMoney(value),
  },
  {
    title: 'Duração',
    dataIndex: 'duration',
    render: (value) => renderDuration(value),
  },
]

export type TableServiceProps = {
  data: Service[]
  total: number
  loading: boolean
  pagination: TableProps<Service>['pagination']
  selectedItems: Service[]
  changeSelectedItems: (items: Service[]) => void
  onClickOptions: (event: OptionsEvent, record: Service) => void
  onClickCreate: () => void
  onClickFilter: () => void
  onClickDeleteAll: () => void
}

const TableService = ({
  data,
  total,
  loading,
  pagination,
  selectedItems,
  changeSelectedItems,
  onClickOptions,
  onClickCreate,
  onClickFilter,
  onClickDeleteAll,
}: TableServiceProps) => {
  return (
    <>
      <TableX.Header
        title="Serviços"
        count={total}
        selectedCount={selectedItems.length}
        onClickCreate={onClickCreate}
        onClickFilter={onClickFilter}
        onClickDeleteAll={onClickDeleteAll}
      />
      <TableX.Container>
        <Table
          loading={loading}
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

export default TableService
