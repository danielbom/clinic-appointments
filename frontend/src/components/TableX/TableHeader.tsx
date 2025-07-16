import { Tag, Button } from 'antd'

import { PlusOutlined, FilterOutlined, DeleteOutlined } from '@ant-design/icons'
import './TableHeader.css'
import React from 'react'

type TableHeaderProps = {
  title: string
  count: number
  selectedCount: number
  onClickCreate: () => void
  onClickFilter?: () => void
  onClickDeleteAll: () => void
  noHeaderSelection?: boolean
}

function c(className: string) {
  return ({ children }: React.PropsWithChildren<{}>) => <div className={className}>{children}</div>
}

const TableHeaderContainer = c('table-header')
const TableHeaderFirst = c('table-header-first')
const TableHeaderButtons = c('table-header-buttons')

type TableHeaderSelectionProps = {
  selectedCount: number
  onClickDeleteAll: () => void
}
const TableHeaderSelection = ({ selectedCount, onClickDeleteAll }: TableHeaderSelectionProps) => {
  return (
    <div className="table-header-second">
      {!!selectedCount && (
        <div className="table-header-selection">
          Selecionados ({selectedCount})
          <Button type="text" size="small" onClick={onClickDeleteAll}>
            <DeleteOutlined />
            Deletar todos
          </Button>
        </div>
      )}
    </div>
  )
}

type TableHeaderTitleProps = {
  title: string
  count: number
}
const TableHeaderTitle = ({ title, count }: TableHeaderTitleProps) => {
  return (
    <div className="table-header-title">
      <h1>{title}</h1>
      <Tag>{count}</Tag>
    </div>
  )
}

function TableHeader({
  title,
  count,
  selectedCount,
  onClickCreate,
  onClickFilter,
  onClickDeleteAll,
  noHeaderSelection,
}: TableHeaderProps) {
  return (
    <TableHeaderContainer>
      <TableHeaderFirst>
        <TableHeaderTitle title={title} count={count} />
        <TableHeaderButtons>
          <Button type="primary" onClick={onClickCreate}>
            <PlusOutlined /> Criar
          </Button>
          {onClickFilter && (
            <Button type="default" onClick={onClickFilter}>
              <FilterOutlined /> Filtrar
            </Button>
          )}
        </TableHeaderButtons>
      </TableHeaderFirst>
      {!noHeaderSelection && <TableHeaderSelection selectedCount={selectedCount} onClickDeleteAll={onClickDeleteAll} />}
    </TableHeaderContainer>
  )
}

TableHeader.Container = TableHeaderContainer
TableHeader.First = TableHeaderFirst
TableHeader.Title = TableHeaderTitle
TableHeader.Buttons = TableHeaderButtons
TableHeader.Selection = TableHeaderSelection

export default TableHeader
