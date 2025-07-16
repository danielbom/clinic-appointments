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

export function useAuth() {
  return useContext(AuthContext)
}

const login = async (api: Api) => {
  function loginFail() {
    localStorage.removeItem(AUTH_ACCESS_KEY)
    localStorage.removeItem(AUTH_REFRESH_KEY)
    return null
  }

  function loginSuccess(identity: Identity) {
    const accessToken = localStorage.getItem(AUTH_ACCESS_KEY)
    api._config.instance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
    return identity
  }

  if (!localStorage.getItem(AUTH_ACCESS_KEY)) return loginFail()

  try {
    const accessToken = localStorage.getItem(AUTH_ACCESS_KEY)
    api._config.instance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
    const response = await api.auth.me()
    if (response.data) {
      return loginSuccess(response.data)
    }
  } catch (e) {
    // ignore
  }

  if (!localStorage.getItem(AUTH_REFRESH_KEY)) return loginFail()

  try {
    const refreshToken = localStorage.getItem(AUTH_REFRESH_KEY)
    api._config.instance.defaults.headers.common['Authorization'] = `Bearer ${refreshToken}`
    const response = await api.auth.refresh()
    const newAccessToken = response.data.accessToken
    localStorage.setItem(AUTH_ACCESS_KEY, newAccessToken)
  } catch (e) {
    return loginFail()
  }

  try {
    const accessToken = localStorage.getItem(AUTH_ACCESS_KEY)
    api._config.instance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
    const response = await api.auth.me()
    if (response.data) {
      return loginSuccess(response.data)
    }
  } catch (e) {
    // ignore
  }

  return loginFail()
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
    if (state.action === 'LOGIN') {
      login(api)
        .then((identity) => {
          if (identity) {
            dispatch({ type: 'LOGIN-SUCCESS', payload: identity })
          } else {
            dispatch({ type: 'LOGOUT' })
          }
        })
        .catch(() => {
          dispatch({ type: 'LOGOUT' })
        })
    }
  }, [state.action])

  useEffect(() => {
    if (state.isAuthenticated) {
      let retrying: Promise<boolean> | null = null
      const { requestInterceptorId, responseInterceptorId } = axiosRetry(api._config.instance, {
        retries: 1,
        retryCondition: async (error: any) => {
          if (isAxiosError(error)) {
            if (error.response?.status === 401) {
              if (retrying) {
                return false
              } else {
                retrying = (async () => {
                  try {
                    const identity = await login(api)
                    if (identity) {
                      dispatch({ type: 'LOGIN-SUCCESS', payload: identity })
                      return true
                    } else {
                      dispatch({ type: 'LOGOUT' })
                    }
                  } catch (_) {
                    dispatch({ type: 'LOGOUT' })
                  } finally {
                    retrying = null
                  }
                  return false
                })()
                return await retrying
              }
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
