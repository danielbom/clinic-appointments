import { Table, TableColumnType, TableProps } from 'antd'

import type { OptionsEvent } from '../../../TableX/TableOptions'
import TableX from '../../../TableX'

import type { Customer } from './types'

import normalizeCPF from '../../../../lib/normalizers/normalizeCPF'
import normalizePhone from '../../../../lib/normalizers/normalizePhone'

import renderDate from '../../../../lib/renders/renderDate'
import renderAge from '../../../../lib/renders/rendertAge'

const columns: TableColumnType<Customer>[] = [
  {
    title: 'Nome',
    dataIndex: 'name',
  },
  {
    title: 'CPF',
    dataIndex: 'cpf',
    render: normalizeCPF,
  },
  {
    title: 'E-mail',
    dataIndex: 'email',
  },
  {
    title: 'Telefone',
    dataIndex: 'phone',
    render: normalizePhone,
  },
  {
    title: 'Data de Nasc.',
    dataIndex: 'birthdate',
    render: renderDate,
  },
  {
    title: 'Idade',
    dataIndex: 'birthdate',
    render: renderAge,
  },
]

export interface TableCustomerProps {
  data: Customer[]
  total: number
  loading: boolean
  pagination: TableProps<Customer>['pagination']
  selectedItems: Customer[]
  changeSelectedItems: (items: Customer[]) => void
  onClickOptions: (event: OptionsEvent, record: Customer) => void
  onClickCreate: () => void
  onClickFilter: () => void
  onClickDeleteAll: () => void
}

const TableCustomer = ({
  data,
  total,
  pagination,
  selectedItems,
  changeSelectedItems,
  onClickOptions,
  onClickCreate,
  onClickFilter,
  onClickDeleteAll,
}: TableCustomerProps) => {
  return (
    <>
      <TableX.Header
        title="Clientes"
        count={total}
        selectedCount={selectedItems.length}
        onClickCreate={onClickCreate}
        onClickFilter={onClickFilter}
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

export default TableCustomer
