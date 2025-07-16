import { Menu, TableColumnType } from 'antd'
import { MoreOutlined } from '@ant-design/icons'

import { EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import './TableOptions.css'

export type OptionsEvent = 'show' | 'edit' | 'delete'

const items = [
  {
    key: 'actions',
    label: <MoreOutlined />,
    className: 'actions-menu-icon',
    children: [
      { key: 'show', label: 'Ver', icon: <EyeOutlined /> },
      { key: 'edit', label: 'Editar', icon: <EditOutlined /> },
      {
        key: 'delete',
        label: 'Deletar',
        icon: <DeleteOutlined />,
        danger: true,
      },
    ],
  },
]

type TableOptionsRenderProps = {
  onClick: (event: OptionsEvent) => void
}

export function TableOptionsMenu({ onClick }: TableOptionsRenderProps) {
  return (
    <Menu
      className="actions-menu"
      onClick={(info) => onClick(info.key as OptionsEvent)}
      items={items}
      selectable={false}
      expandIcon={null}
    />
  )
}

function TableOptions<T>(onClick: (event: OptionsEvent, record: T) => void): TableColumnType<T> {
  return {
    key: 'actions',
    title: ' ',
    className: 'actions-column',
    render: (_text, record) => <TableOptionsMenu onClick={(event) => onClick(event, record)} />,
  }
}

export default TableOptions
