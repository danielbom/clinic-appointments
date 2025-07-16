import AdminPage from './admin/AdminPage'
import 'antd/dist/reset.css'
import { ConfigProvider } from 'antd'
import pt_BR from 'antd/locale/pt_BR'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import ReactQueryDevtoolsLazy from '../components/ReactQueryDevtoolsLazy'

import { ApiProvider } from '../context/ApiContext'
import { AuthProvider } from '../context/AuthContext'
import { loadTheme } from '../lib/theme'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
    },
  },
})

function Root() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider locale={pt_BR} theme={loadTheme()}>
        <ApiProvider>
          <AuthProvider>
            <AdminPage />
          </AuthProvider>
        </ApiProvider>
      </ConfigProvider>
      <ReactQueryDevtoolsLazy initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default Root
