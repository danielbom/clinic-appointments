import { List } from 'antd'

type Record = {
  id: string
  content: string
}

interface DeleteListProps {
  records: Record[]
}

function DeleteList({ records }: DeleteListProps) {
  return (
    <List bordered size="small">
      {records.map((record) => (
        <List.Item key={record.id}>{record.content}</List.Item>
      ))}
    </List>
  )
}

export default DeleteList
