import './ShowContainer.css'

export default function ShowContainer({ children }: React.PropsWithChildren<{}>) {
  return <div className="show-container">{children}</div>
}
