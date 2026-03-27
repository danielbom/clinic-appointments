import { useEffect, useMemo } from 'react'
import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
import { CalendarOutlined, UserOutlined, ProfileOutlined, ApartmentOutlined } from '@ant-design/icons'

import AdminBreadcrumb from '../../components/AdminX/AdminBreadcrumb'
import AdminLayout from '../../components/AdminX/AdminLayout'
import PageLoading from '../../components/Loading/PageLoading'

import PageAppointmentImpl from '../pages/appointments/PageAppointmentImpl'
import PageAuthImpl from '../pages/auth/PageAuthImpl'
import PageCustomerImpl from '../pages/customers/PageCustomerImpl'
import PageSecretaryImpl from '../pages/secretaries/PageSecretaryImpl'
import PageServiceAvailableImpl from '../pages/services-available/PageServiceAvailableImpl'
import PageServiceImpl from '../pages/services/PageServiceImpl'
import PageSpecialistImpl from '../pages/specialists/PageSpecialistImpl'
import PageSpecializationImpl from '../pages/specializations/PageSpecializationImpl'

import { useAuth } from '../../context/AuthContext'
import { RedirectTo } from '../../components/RedirectTo'
import { useSearchParamState } from '../../hooks/useSearchParam'
import { getPageMode } from '../../components/AdminX/tools'

const RE_PATH = /^\/([\w-]+)/

interface PageItem {
  key: string
  label: string
  icon: React.ReactNode
  roles?: string[]
}

const pageItems: PageItem[] = [
  { key: 'appointments', label: 'Agendamentos', icon: <CalendarOutlined /> },
  { key: 'customers', label: 'Clientes', icon: <UserOutlined /> },
  { key: 'specialists', label: 'Especialistas', icon: <UserOutlined /> },
  { key: 'secretaries', label: 'Secretários', icon: <UserOutlined />, roles: ['admin'] },
  { key: 'services', label: 'Serviços', icon: <ProfileOutlined /> },
  { key: 'services-available', label: 'Serviços disponíveis', icon: <ProfileOutlined /> },
  { key: 'specializations', label: 'Especializações', icon: <ApartmentOutlined /> },
]

function AdminPageRoutesLayout() {
  const [paramsState] = useSearchParamState()
  const mode = getPageMode(paramsState, 'list')
  const navigate = useNavigate()
  const location = useLocation()
  const [{ isLoading, isAuthenticated, identity }, authDispatch] = useAuth()

  const items = useMemo(() => {
    return pageItems.filter((item) =>
      item.roles && item.roles.length > 0 ? identity && item.roles.includes(identity.role) : true,
    )
  }, [identity?.role])

  const pageKey = useMemo(() => {
    const path = window.location.pathname.match(RE_PATH)?.[1] ?? ''
    const item = items.find((item) => item.key === path)
    return item?.key
  }, [items, location.pathname])

  const item = items.find((item) => item.key === pageKey)
  const title = item?.label

  useEffect(() => {
    if (title) {
      window.document.title = `AS - ${title}`
    } else {
      window.document.title = 'Agenda de Serviços'
    }
  }, [title])

  if (isLoading) {
    return <PageLoading />
  }

  if (!isAuthenticated) {
    return <RedirectTo to="/auth" />
  }

  if (!pageKey) {
    return <RedirectTo to={`/${items[0].key}`} />
  }

  return (
    <AdminLayout
      items={items}
      pageKey={pageKey}
      username={identity?.name ?? ''}
      onClickMenu={(key) => {
        switch (key) {
          case 'logout': {
            authDispatch({ type: 'LOGOUT' })
            navigate('/auth')
            break
          }
          default: {
            console.warn('Unknown key:', key)
          }
        }
      }}
    >
      <AdminBreadcrumb mode={mode} title={title} pageKey={pageKey} />

      <Outlet />
    </AdminLayout>
  )
}

function MovePage() {
  const [search] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const searchParams = new URLSearchParams(search)
    const key = searchParams.get('key') ?? ''
    searchParams.delete('key')
    navigate(`/${key}?${searchParams}`)
  }, [navigate, search])

  return <PageLoading />
}

const router = createBrowserRouter([
  {
    path: '/auth',
    element: <PageAuthImpl />,
  },
  {
    path: '/',
    element: <AdminPageRoutesLayout />,
    children: [
      {
        path: 'appointments',
        element: <PageAppointmentImpl />,
      },
      {
        path: 'customers',
        element: <PageCustomerImpl />,
      },
      {
        path: 'specialists',
        element: <PageSpecialistImpl />,
      },
      {
        path: 'specializations',
        element: <PageSpecializationImpl />,
      },
      {
        path: 'secretaries',
        element: <PageSecretaryImpl />,
      },
      {
        path: 'services',
        element: <PageServiceImpl />,
      },
      {
        path: 'services-available',
        element: <PageServiceAvailableImpl />,
      },
    ],
  },
  {
    path: '_move',
    element: <MovePage />,
  },
])

function AdminPage() {
  return <RouterProvider router={router} />
}

export default AdminPage
