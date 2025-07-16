import { Form, Input, Button, Checkbox, Alert } from 'antd'
import { UserOutlined, LockOutlined, EyeTwoTone, EyeInvisibleOutlined, LoadingOutlined } from '@ant-design/icons'

import './PageAuth.css'

import AppLogo from '../../../components/AppLogo'

import { emailIsInvalid, emailIsRequired } from '../../../lib/rules/email'
import { passwordIsInvalid, passwordIsRequired } from '../../../lib/rules/password'

export type PageAuthValues = {
  email: string
  password: string
  remember: boolean
}

type PageAuthProps = {
  onSubmit: (values: PageAuthValues) => void
  error?: string
  loading?: boolean
}

function PageAuth({ onSubmit, error, loading }: PageAuthProps) {
  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-logo">
          <AppLogo />
        </div>
        <Form name="login_form" layout="vertical" onFinish={onSubmit} validateTrigger={['onBlur']}>
          <Form.Item name="email" rules={[emailIsRequired, emailIsInvalid]}>
            <Input prefix={<UserOutlined />} placeholder="E-mail" />
          </Form.Item>
          <Form.Item name="password" rules={[passwordIsRequired, passwordIsInvalid]}>
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Senha"
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              minLength={2}
              maxLength={20}
            />
          </Form.Item>
          <Form.Item>
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>Lembrar-me</Checkbox>
            </Form.Item>

            {/* TODO: */}
            <a className="login-form-forgot" href="" onClick={(e) => loading && e.preventDefault()}>
              Esqueceu a senha?
            </a>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login-form-button"
              disabled={loading}
              icon={loading && <LoadingOutlined />}
            >
              Entrar
            </Button>
            Ou{' '}
            <a href="" onClick={(e) => loading && e.preventDefault()}>
              Registre-se agora!
            </a>
          </Form.Item>
          <Form.Item>{error && <Alert message={error} type="error" />}</Form.Item>
        </Form>
      </div>
    </div>
  )
}

export default PageAuth
