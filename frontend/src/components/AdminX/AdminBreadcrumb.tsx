import React from 'react'
import { Breadcrumb } from 'antd'

import type { PageMode } from './types'
import { Link } from 'react-router-dom'

interface AdminBreadcrumbProps {
  title: React.ReactNode
  mode: PageMode
  pageKey: string
}

function AdminBreadcrumb({ title, pageKey, mode }: AdminBreadcrumbProps) {
  switch (mode) {
    case 'list':
      return <Breadcrumb items={[{ title, href: '#' }]} />
    case 'show':
      return (
        <Breadcrumb
          items={[
            { title: <Link to={`/${pageKey}`}>#</Link> }, //
            { title: 'Ver', href: '#view' },
          ]}
        />
      )
    case 'create':
      return (
        <Breadcrumb
          items={[
            { title: <Link to={`/${pageKey}`}>#</Link> }, //
            { title: 'Criar', href: '#create' },
          ]}
        />
      )
    case 'edit':
      return (
        <Breadcrumb
          items={[
            { title: <Link to={`/${pageKey}`}>#</Link> }, //
            { title: 'Editar', href: '#edit' },
          ]}
        />
      )
  }
  throw new Error('Invalid mode')
}

export default AdminBreadcrumb
