import { Menu, MenuProps } from 'antd'
import AppLogo from '../AppLogo'

import './AdminSidebar.css'
import { Link } from 'react-router-dom'

interface AdminSidebarProps {
  items: MenuProps['items']
  pageKey: string
  onSelectPage: (pageKey: string) => void
}

function AdminSidebar({ items, pageKey, onSelectPage }: AdminSidebarProps) {
  return (
    <>
      <div className="sidebar-logo">
        <AppLogo madeByVisible />
      </div>
      <section>
        <h3 className="navigation-title">NAVEGAÇÃO</h3>
        <Menu
          mode="inline"
          defaultSelectedKeys={['1']}
          selectedKeys={[pageKey]}
          onClick={({ key }) => onSelectPage(key)}
          items={items?.map((item) =>
            item && 'label' in item
              ? { ...item, label: item.key ? <Link to={`/${item.key}`}>{item.label}</Link> : item.label }
              : item,
          )}
        />
      </section>
    </>
  )
}

export default AdminSidebar
