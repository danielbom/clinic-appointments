import { LogoutOutlined, MenuOutlined, UserOutlined } from '@ant-design/icons'
import { Avatar, Dropdown, Layout } from 'antd'
import './AdminHeader.css'

export type AdminHeaderEvent = 'logout'

interface AdminHeaderProps {
  onOpenSidebar: () => void
  username: string
  onClickMenu: (event: AdminHeaderEvent) => void
}

function AdminHeader({ onOpenSidebar, onClickMenu, username }: AdminHeaderProps) {
  return (
    <Layout.Header className="responsive layout-header">
      <MenuOutlined className="hamburger" onClick={onOpenSidebar} />
      <div />
      <div className="layout-user">
        <span>{username}</span>
        <Dropdown
          placement="bottomRight"
          menu={{
            onClick: (info) => onClickMenu(info.key as AdminHeaderEvent),
            items: [{ key: 'logout', label: 'Log out', icon: <LogoutOutlined /> }],
          }}
        >
          <Avatar icon={<UserOutlined />} style={{ marginRight: 8 }} />
        </Dropdown>
      </div>
    </Layout.Header>
  )
}

export default AdminHeader
