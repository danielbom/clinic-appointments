import { lazy, Suspense, useState } from 'react'

import PageLoading from '../../../components/Loading/PageLoading'
import isAxiosError from '../../../lib/axios/isAxiosError'
import type { PageAuthValues } from './PageAuth'
import { RedirectTo } from '../../../components/RedirectTo'
import { useApi } from '../../../context/ApiContext'
import { useAuth } from '../../../context/AuthContext'
import useLoading from '../../../hooks/useLoading'

const PageAuth = lazy(() => import('./PageAuth'))

function PageAuthImpl() {
  const api = useApi()
  const [{ isAuthenticated }, authDispatch] = useAuth()
  const [isLoading, loader] = useLoading()
  const [error, setError] = useState('')

  function onSubmit(values: PageAuthValues) {
    loader(async () => {
      try {
        const response = await api.auth.login({
          email: values.email,
          password: values.password,
        })
        authDispatch({ type: 'LOGIN', payload: response.data })
      } catch (error) {
        if (isAxiosError(error)) {
          if (error.status === 400) {
            setError('E-mail ou senha inválidos')
          } else if (error.message === 'Network Error') {
            setError('Sem conexão com a internet.')
          } else {
            setError('Erro desconhecido: ' + (error.response?.data || error.message))
          }
        } else {
          setError('Erro desconhecido: ' + error)
        }
      }
    })
  }

  if (isAuthenticated) {
    return <RedirectTo to="/" />
  }

  return (
    <Suspense fallback={<PageLoading />}>
      <PageAuth error={error} onSubmit={onSubmit} loading={isLoading} />
    </Suspense>
  )
}

export default PageAuthImpl
