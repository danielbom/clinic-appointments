import { TableProps } from 'antd'

import { type OptionsEvent } from '../../../../TableX/TableOptions'

import type { ServiceAvailable } from '../types'

import TableServiceAvailableAsFlexList from './TableServiceAvailableAsFlexList'

export type TableServiceAvailableProps = {
  data: ServiceAvailable[]
  total: number
  pagination: TableProps<ServiceAvailable>['pagination']
  selectedItems: ServiceAvailable[]
  changeSelectedItems: (items: ServiceAvailable[]) => void
  onClickOptions: (event: OptionsEvent, record: ServiceAvailable) => void
  onClickCreate: () => void
  onClickDeleteAll: () => void
}

const TableServiceAvailable = (props: TableServiceAvailableProps) => {
  // return <TableServiceAvailableAsTable {...props} />
  // return <TableServiceAvailableCollapsedAsList {...props} />
  return <TableServiceAvailableAsFlexList {...props} />
}

export default TableServiceAvailable
