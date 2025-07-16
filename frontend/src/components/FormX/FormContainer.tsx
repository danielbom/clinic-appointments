import './FormContainer.css'

type FormContaienrProps = {
  children: React.ReactNode
}

function FormContainer({ children }: FormContaienrProps) {
  return <div className="form-container">{children}</div>
}

export default FormContainer
