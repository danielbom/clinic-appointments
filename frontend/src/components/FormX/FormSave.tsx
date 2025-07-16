import { Button, ButtonProps } from 'antd'

import './FormSave.css'

type FormSaveProps = {
  onClick?: ButtonProps['onClick']
  htmlType?: ButtonProps['htmlType']
}

function FormSave({ onClick, htmlType }: FormSaveProps) {
  return (
    <div className="form-save">
      <Button type="primary" onClick={onClick} htmlType={htmlType}>
        Save
      </Button>
    </div>
  )
}

export default FormSave
