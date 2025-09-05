import { Table, TableColumnType, TableProps } from 'antd'

import type { OptionsEvent } from '../../../TableX/TableOptions'
import TableX from '../../../TableX'

import type { Secretary } from './types'

import normalizeCNPJ from '../../../../lib/normalizers/normalizeCNPJ'
import normalizeCPF from '../../../../lib/normalizers/normalizeCPF'
import normalizePhone from '../../../../lib/normalizers/normalizePhone'

import renderDate from '../../../../lib/renders/renderDate'
import renderAge from '../../../../lib/renders/rendertAge'

const columns: TableColumnType<Secretary>[] = [
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
    title: 'CNPJ',
    dataIndex: 'cnpj',
    render: normalizeCNPJ,
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

export interface TableSecretaryProps {
  data: Secretary[]
  total: number
  loading: boolean
  pagination: TableProps<Secretary>['pagination']
  selectedItems: Secretary[]
  changeSelectedItems: (items: Secretary[]) => void
  onClickOptions: (event: OptionsEvent, record: Secretary) => void
  onClickCreate: () => void
  onClickFilter: () => void
  onClickDeleteAll: () => void
}

const TableSecretary = ({
  data,
  total,
  pagination,
  selectedItems,
  changeSelectedItems,
  onClickOptions,
  onClickCreate,
  onClickFilter,
  onClickDeleteAll,
}: TableSecretaryProps) => {
  return (
    <>
      <TableX.Header
        title="Secretários"
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

export default TableSecretary
