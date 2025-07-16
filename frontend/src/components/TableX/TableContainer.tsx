import './TableContainer.css'

type TableContainerProps = {
  children: React.ReactNode
}

function TableContainer({ children }: TableContainerProps) {
  return <div className="table-container">{children}</div>
}

export default TableContainer
