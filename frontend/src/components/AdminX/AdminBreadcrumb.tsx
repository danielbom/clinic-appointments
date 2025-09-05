import React from 'react'
import { Breadcrumb } from 'antd'

import type { ChangePageMode, PageMode } from './types'

interface AdminBreadcrumbProps {
  title: React.ReactNode
  mode: PageMode
  changeMode: ChangePageMode
}

function AdminBreadcrumb({ title, mode, changeMode }: AdminBreadcrumbProps) {
  switch (mode) {
    case 'list':
      return <Breadcrumb items={[{ title, href: '#' }]} />
    case 'show':
      return (
        <Breadcrumb
          items={[
            { title, href: '#', onClick: () => changeMode('list') },
            { title: 'Ver', href: '#view' },
          ]}
        />
      )
    case 'create':
      return (
        <Breadcrumb
          items={[
            { title, href: '#', onClick: () => changeMode('list') },
            { title: 'Criar', href: '#create' },
          ]}
        />
      )
    case 'edit':
      return (
        <Breadcrumb
          items={[
            { title, href: '#', onClick: () => changeMode('list') },
            { title: 'Editar', href: '#edit' },
          ]}
        />
      )
  }
  throw new Error('Invalid mode')
}

export default AdminBreadcrumb
