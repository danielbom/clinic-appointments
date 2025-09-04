import { Flex, List } from 'antd'
import './TableServiceAvailableAsFlexList.css'

import TableX from '../../../../TableX'

import useTableToGroupServices from './useTableToGroupServices'
import { TableServiceAvailableProps } from './index'

export default function TableServiceAvailable(props: TableServiceAvailableProps) {
  const groups = useTableToGroupServices(props.data)

  return (
    <>
      <TableX.Header
        title="Serviços disponíveis"
        count={props.total}
        selectedCount={props.selectedItems.length}
        onClickCreate={props.onClickCreate}
        onClickDeleteAll={props.onClickDeleteAll}
        noHeaderSelection
      />
      <TableX.Container>
        <Flex wrap gap="1rem" justify="center">
          {groups.map((group) => (
            <List
              key={group.id}
              className="custom-list"
              header={<div className="custom-list-header">{group.name}</div>}
              dataSource={group.services}
              bordered
              renderItem={(item) => (
                <List.Item className="custom-list-item">
                  <List.Item.Meta title={item.name} />
                  <TableX.OptionsMenu onClick={(event) => props.onClickOptions(event, item)} />
                </List.Item>
              )}
            />
          ))}
        </Flex>
      </TableX.Container>
    </>
  )
}
