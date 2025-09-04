import { Button, Table, TableColumnType, TableProps } from 'antd'
import { FilterOutlined, PlusOutlined, CalendarOutlined } from '@ant-design/icons'

import type { OptionsEvent } from '../../../TableX/TableOptions'
import TableX from '../../../TableX'

import type { Appointment } from './types'
import renderDateHour from '../../../../lib/renders/renderDateHour'
import renderMoney from '../../../../lib/renders/renderMoney'
import renderDuration from '../../../../lib/renders/renderDuration'
import renderTagStatus from '../../../../lib/renders/renderBadgeStatus'

const columns: TableColumnType<Appointment>[] = [
  {
    title: 'Status',
    dataIndex: 'status',
    align: 'center',
    width: 80,
    render: (value) => renderTagStatus(value),
  },
  {
    title: 'Horário',
    dataIndex: 'date',
    align: 'left',
    render: (_, record) => renderDateHour(record.date, record.time),
  },
  {
    title: 'Duração',
    dataIndex: 'duration',
    align: 'center',
    render: (value) => renderDuration(value),
  },
  {
    title: 'Cliente',
    dataIndex: 'customerName',
  },
  {
    title: 'Serviço',
    dataIndex: 'serviceName',
  },
  {
    title: 'Especialista',
    dataIndex: 'specialistName',
  },
  {
    title: 'Valor',
    dataIndex: 'price',
    align: 'right',
    render: (value) => renderMoney(value),
  },
]

export type TableAppointmentProps = {
  data: Appointment[]
  total: number
  pagination: TableProps<Appointment>['pagination']
  selectedItems: Appointment[]
  changeSelectedItems: (items: Appointment[]) => void
  onClickOptions: (event: OptionsEvent, record: Appointment) => void
  onClickCreate: () => void
  onClickFilter: () => void
  onClickDeleteAll: () => void
  onClickCalendar: () => void
}

const TableAppointment = ({
  data,
  total,
  pagination,
  selectedItems,
  changeSelectedItems,
  onClickOptions,
  onClickCreate,
  onClickFilter,
  onClickDeleteAll,
  onClickCalendar,
}: TableAppointmentProps) => {
  return (
    <>
      <TableX.Header.Container>
        <TableX.Header.First>
          <TableX.Header.Title title="Agendamentos" count={total} />
          <TableX.Header.Buttons>
            <Button type="primary" onClick={onClickCreate}>
              <PlusOutlined /> Criar
            </Button>
            <Button type="default" onClick={onClickFilter}>
              <FilterOutlined /> Filtrar
            </Button>
            <Button type="primary" onClick={onClickCalendar}>
              <CalendarOutlined /> Calendario
            </Button>
          </TableX.Header.Buttons>
        </TableX.Header.First>
        <TableX.Header.Selection selectedCount={selectedItems.length} onClickDeleteAll={onClickDeleteAll} />
      </TableX.Header.Container>
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

export default TableAppointment
