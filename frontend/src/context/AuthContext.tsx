import { createContext, useContext, useEffect, useReducer } from 'react'
import { Api, Identity } from '../lib/api'
import { useApi } from './ApiContext'
import { AUTH_ACCESS_KEY, AUTH_REFRESH_KEY } from '../lib/keys'
import isAxiosError from '../lib/axios/isAxiosError'
import axiosRetry from 'axios-retry'

type Auth = {
  isAuthenticated: boolean
  identity: Identity | null
  action: 'LOGIN' | null // internal
  isLoading: boolean
}

type AuthAction =
  | { type: 'LOGOUT' }
  | { type: 'LOGIN'; payload: { accessToken: string; refreshToken: string } }
  | { type: 'LOGIN-SUCCESS'; payload: Identity } // internal

const AuthContext = createContext<[Auth, React.Dispatch<AuthAction>]>([
  {
    isAuthenticated: false,
    identity: null,
    action: null,
    isLoading: true,
  },
  () => {},
])

function reducer(state: Auth, action: AuthAction): Auth {
  switch (action.type) {
    case 'LOGIN': {
      localStorage.setItem(AUTH_ACCESS_KEY, action.payload.accessToken)
      localStorage.setItem(AUTH_REFRESH_KEY, action.payload.refreshToken)
      return { isAuthenticated: false, identity: null, action: 'LOGIN', isLoading: true }
    }
    case 'LOGIN-SUCCESS': {
      return { isAuthenticated: true, identity: action.payload, action: null, isLoading: false }
    }
    case 'LOGOUT': {
      localStorage.removeItem(AUTH_ACCESS_KEY)
      localStorage.removeItem(AUTH_REFRESH_KEY)
      return { isAuthenticated: false, identity: null, action: null, isLoading: false }
    }
  }
  return state
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const api = useApi()
  const [state, dispatch] = useReducer(reducer, {
    isAuthenticated: false,
    identity: null,
    isLoading: true,
    action: 'LOGIN',
  })

  useEffect(() => {
    async function login(retry = false) {
      try {
        const accessToken = localStorage.getItem(AUTH_ACCESS_KEY)
        api._config.instance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
        const response = await api.auth.me()
        return dispatch({ type: 'LOGIN-SUCCESS', payload: response.data })
      } catch (error) {
        if (retry) return dispatch({ type: 'LOGOUT' })
        if (isAxiosError(error)) {
          if (error.response?.status === 401) {
            await refreshToken(api)
            return login(true)
          }
        }
        throw error
      }
    }

    if (state.action === 'LOGIN') login()
  }, [state.action])

  useEffect(() => {
    if (state.isAuthenticated) {
      let refreshing: Promise<boolean> | null = null
      const { requestInterceptorId, responseInterceptorId } = axiosRetry(api._config.instance, {
        retries: 1,
        retryCondition: async (error: any) => {
          if (isAxiosError(error)) {
            if (error.response?.status === 401) {
              if (refreshing) return await refreshing
              refreshing = (async () => {
                const ok = await refreshToken(api)
                if (!ok) dispatch({ type: 'LOGOUT' })
                refreshing = null
                return ok
              })()
              return await refreshing
            }
          }
          return false
        },
      })
      return () => {
        api._config.instance.interceptors.request.eject(requestInterceptorId)
        api._config.instance.interceptors.response.eject(responseInterceptorId)
      }
    }
  }, [state.isAuthenticated])

  return <AuthContext.Provider value={[state, dispatch]}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}

const refreshToken = async (api: Api) => {
  const refreshToken = localStorage.getItem(AUTH_REFRESH_KEY)
  if (!refreshToken) return false

  try {
    const response = await api.auth.refresh(refreshToken)
    const newAccessToken = response.data.accessToken
    localStorage.setItem(AUTH_ACCESS_KEY, newAccessToken)
    api._config.instance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`
    return true
  } catch (e) {
    localStorage.removeItem(AUTH_ACCESS_KEY)
    localStorage.removeItem(AUTH_REFRESH_KEY)
    return false
  }
}
