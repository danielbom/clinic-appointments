import { Table, TableColumnType, TableProps } from 'antd'

import type { OptionsEvent } from '../../../TableX/TableOptions'
import TableX from '../../../TableX'

import type { Specialist } from './types'

import normalizeCPF from '../../../../lib/normalizers/normalizeCPF'
import normalizePhone from '../../../../lib/normalizers/normalizePhone'
import renderDate from '../../../../lib/renders/renderDate'
import renderAge from '../../../../lib/renders/rendertAge'
import normalizeCNPJ from '../../../../lib/normalizers/normalizeCNPJ'

const columns: TableColumnType<Specialist>[] = [
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
  {
    title: 'CNPJ',
    dataIndex: 'cnpj',
    render: normalizeCNPJ,
  },
]

export interface TableSpecialistProps {
  data: Specialist[]
  total: number
  loading: boolean
  pagination: TableProps<Specialist>['pagination']
  selectedItems: Specialist[]
  changeSelectedItems: (items: Specialist[]) => void
  onClickOptions: (event: OptionsEvent, record: Specialist) => void
  onClickCreate: () => void
  onClickFilter: () => void
  onClickDeleteAll: () => void
}

const TableSpecialist = ({
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
}: TableSpecialistProps) => {
  return (
    <>
      <TableX.Header
        title="Especialistas"
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
          loading={loading}
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

export default TableSpecialist
