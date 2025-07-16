import { useEffect, useState } from 'react'
import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  useNavigate,
  useNavigation,
  useSearchParams,
} from 'react-router-dom'
import { CalendarOutlined, UserOutlined, ProfileOutlined, ApartmentOutlined } from '@ant-design/icons'

import { ChangePageMode, PageMode } from '../../components/AdminX/types'
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

import { AdminProvider, useAdmin } from './AdminContext'
import AdminItem from './AdminItem'
import { useAuth } from '../../context/AuthContext'
import { RedirectTo } from '../../components/RedirectTo'

const usePageStateMode = () => {
  const { state } = useAdmin()
  const [_, setSearch] = useSearchParams()

  const changeMode: ChangePageMode = (pageMode, pageState) => {
    const searchParams = new URLSearchParams()
    searchParams.set('mode', pageMode)
    if (pageState) {
      for (const key in pageState) {
        if (pageState[key] === 0 || pageState[key]) {
          searchParams.set(key, pageState[key].toString())
        }
      }
    }
    setSearch(searchParams.toString())
  }

  return [state.state, state.mode, changeMode] as const
}

const RE_PATH = /^\/([\w-]+)/

// OBS: Overcomplicated way to handle the page state (query params) and mode (list, create...)
// TODO: Should I try other approaches?
function AdminPageRoutesLayout() {
  const { state, dispatch } = useAdmin()
  const [_, mode, changeMode] = usePageStateMode()
  const navigate = useNavigate()
  const navigation = useNavigation()
  const { items, pageKey } = state
  const title = items.find((item) => item.key === pageKey)?.label ?? ''
  const [search] = useSearchParams()
  const [loaded, setLoaded] = useState(false)
  const [{ isLoading, isAuthenticated, identity }, authDispatch] = useAuth()

  useEffect(() => {
    if (items.length === 0) return
    const path = window.location.pathname.match(RE_PATH)?.[1] ?? ''
    const item = items.find((item) => item.key === path)
    if (item) {
      dispatch({ type: 'SET_PAGE_KEY', payload: item.key })
    } else {
      navigate('/' + items[0].key)
      dispatch({ type: 'SET_PAGE_KEY', payload: items[0].key })
    }
  }, [navigate, dispatch, items, navigation.location?.pathname])

  useEffect(() => {
    const searchParams = new URLSearchParams(search)
    const mode = (searchParams.get('mode') as PageMode) ?? 'list'
    searchParams.delete('mode')

    const state: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      state[key] = value
    })

    dispatch({ type: 'SET_STATE_MODE', payload: { mode, state } })
    setLoaded(true)
  }, [dispatch, search])

  if (isLoading) {
    return <PageLoading />
  }

  if (!isAuthenticated) {
    return <RedirectTo to="/auth" />
  }

  if (!loaded) {
    return <PageLoading />
  }

  return (
    <AdminLayout
      items={state.items}
      pageKey={state.pageKey}
      onSelectPage={(key) => {
        dispatch({ type: 'SET_PAGE_KEY_AND_LIST', payload: key })
        navigate('/' + key)
      }}
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
      <AdminBreadcrumb mode={mode} title={title} changeMode={changeMode} />

      <AdminItem pageKey="appointments" pageLabel="Agendamentos" pageIcon={<CalendarOutlined />} />
      <AdminItem pageKey="customers" pageLabel="Clientes" pageIcon={<UserOutlined />} />
      <AdminItem pageKey="specialists" pageLabel="Especialistas" pageIcon={<UserOutlined />} />
      {identity?.role === 'admin' && (
        <AdminItem pageKey="secretaries" pageLabel="Secretários" pageIcon={<UserOutlined />} />
      )}
      <AdminItem pageKey="services" pageLabel="Serviços" pageIcon={<ProfileOutlined />} />
      <AdminItem pageKey="services-available" pageLabel="Serviços disponíveis" pageIcon={<ProfileOutlined />} />
      <AdminItem pageKey="specializations" pageLabel="Especializações" pageIcon={<ApartmentOutlined />} />

      <Outlet />
    </AdminLayout>
  )
}

function withMode(Component: React.ComponentType<any>): React.FC {
  return function (props: any) {
    const [state, mode, changeMode] = usePageStateMode()
    return <Component {...props} state={state} mode={mode} changeMode={changeMode} />
  }
}

const PageAppointment = withMode(PageAppointmentImpl)
const PageCustomer = withMode(PageCustomerImpl)
const PageSecretaries = withMode(PageSecretaryImpl)
const PageService = withMode(PageServiceImpl)
const PageServiceAvailable = withMode(PageServiceAvailableImpl)
const PageSpecialist = withMode(PageSpecialistImpl)
const PageSpecialization = withMode(PageSpecializationImpl)

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
        element: <PageAppointment />,
      },
      {
        path: 'customers',
        element: <PageCustomer />,
      },
      {
        path: 'specialists',
        element: <PageSpecialist />,
      },
      {
        path: 'specializations',
        element: <PageSpecialization />,
      },
      {
        path: 'secretaries',
        element: <PageSecretaries />,
      },
      {
        path: 'services',
        element: <PageService />,
      },
      {
        path: 'services-available',
        element: <PageServiceAvailable />,
      },
    ],
  },
])

function AdminPageRoutesInternal() {
  return <RouterProvider router={router} />
}

function AdminPage() {
  return (
    <AdminProvider>
      <AdminPageRoutesInternal />
    </AdminProvider>
  )
}

export default AdminPage
