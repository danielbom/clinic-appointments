import { Drawer, Layout, MenuProps } from 'antd'
import './responsive.css'
import './AdminLayout.css'

import useDisclosure from '../../hooks/useDisclosure'

import AdminSidebar from './AdminSidebar'
import AdminHeader, { AdminHeaderEvent } from './AdminHeader'

export type AdminLayoutProps = {
  items: MenuProps['items']
  pageKey: string
  onSelectPage: (pageKey: string) => void
  username: string
  onClickMenu: (key: AdminHeaderEvent) => void
  children: React.ReactNode
}

function AdminLayout({ items, pageKey, onSelectPage, username, onClickMenu, children }: AdminLayoutProps) {
  const sidebar = useDisclosure()

  function selectPageAndClose(key: string) {
    onSelectPage(key)
    sidebar.onClose()
  }

  return (
    <Layout>
      <Layout.Sider className="layout-sidebar layout-sidebar-fixed" theme="light" width={275}>
        <AdminSidebar pageKey={pageKey} onSelectPage={selectPageAndClose} items={items} />
      </Layout.Sider>
      <Drawer
        open={sidebar.isOpen}
        onClose={sidebar.onClose}
        className="responsive layout-sidebar layout-sidebar-drawer"
        placement="left"
        extra={null}
        closeIcon={null}
        height="100%"
        width="min(90vw, 275px)"
      >
        <AdminSidebar pageKey={pageKey} onSelectPage={selectPageAndClose} items={items} />
      </Drawer>

      <Layout.Content className="responsive layout-content">
        <AdminHeader onOpenSidebar={sidebar.onOpen} username={username} onClickMenu={onClickMenu} />
        <div className="responsive page-content">{children}</div>
      </Layout.Content>
    </Layout>
  )
}

export default AdminLayout
