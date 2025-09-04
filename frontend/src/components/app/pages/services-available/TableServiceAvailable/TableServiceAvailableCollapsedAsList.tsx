import { TableServiceAvailableProps } from '.'
import { Collapse, List } from 'antd'

import { TableOptionsMenu, type OptionsEvent } from '../../../../TableX/TableOptions'
import TableX from '../../../../TableX'

import useTableToGroupServices from './useTableToGroupServices'
import type { ServiceAvailable } from '../types'

export default function TableServiceAvailableCollapsedAsList({
  data,
  total,
  selectedItems,
  onClickCreate,
  onClickOptions,
  onClickDeleteAll,
}: TableServiceAvailableProps) {
  const groups = useTableToGroupServices(data)

  return (
    <>
      <TableX.Header
        title="Serviços disponíveis"
        count={total}
        selectedCount={selectedItems.length}
        onClickCreate={onClickCreate}
        onClickDeleteAll={onClickDeleteAll}
      />
      <TableX.Container>
        <Collapse
          items={groups.map((specialization) => ({
            key: specialization.id,
            label: specialization.name,
            children: (
              <List bordered dataSource={specialization.services} renderItem={renderServiceItem(onClickOptions)} />
            ),
          }))}
        />
      </TableX.Container>
    </>
  )
}

function renderServiceItem(onClickOptions: (event: OptionsEvent, record: ServiceAvailable) => void) {
  return (item: ServiceAvailable) => {
    return (
      <List.Item>
        <List.Item.Meta title={item.name} />
        <TableOptionsMenu onClick={(event) => onClickOptions(event, item)} />
      </List.Item>
    )
  }
}
