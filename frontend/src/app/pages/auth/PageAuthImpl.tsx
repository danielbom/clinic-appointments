import { lazy, Suspense, useState } from 'react'

import PageLoading from '../../../components/Loading/PageLoading'
import isAxiosError from '../../../lib/axios/isAxiosError'
import { RedirectTo } from '../../../components/RedirectTo'
import { useApi } from '../../../context/ApiContext'
import { useAuth } from '../../../context/AuthContext'
import useLoading from '../../../hooks/useLoading'

import type { PageAuthValues } from '../../../components/app/pages/auth/PageAuth'

const PageAuth = lazy(() => import('../../../components/app/pages/auth/PageAuth'))

function PageAuthImpl() {
  const api = useApi()
  const [{ isAuthenticated }, authDispatch] = useAuth()
  const [isLoading, loader] = useLoading()
  const [errorMessage, setErrorMessage] = useState('')
  const [errorCount, setErrorCount] = useState(0)

  function onSubmit(values: PageAuthValues) {
    loader(async () => {
      try {
        const response = await api.auth.login({
          email: values.email,
          password: values.password,
        })
        authDispatch({ type: 'LOGIN', payload: response.data })
      } catch (error) {
        let newErrorMessage = ''
        if (isAxiosError(error)) {
          if (error.status === 400) {
            newErrorMessage = 'E-mail ou senha inválidos'
          } else if (error.message === 'Network Error') {
            newErrorMessage = 'Sem conexão com a internet.'
          } else {
            newErrorMessage = 'Erro desconhecido: ' + (error.response?.data || error.message)
          }
        } else {
          newErrorMessage = 'Erro desconhecido: ' + error
        }
        if (newErrorMessage === errorMessage) {
          setErrorCount(errorCount + 1)
        } else {
          setErrorCount(0)
          setErrorMessage(newErrorMessage)
        }
      }
    })
  }

  if (isAuthenticated) {
    return <RedirectTo to="/" />
  }

  return (
    <Suspense fallback={<PageLoading />}>
      <PageAuth
        error={errorCount > 0 ? `${errorMessage} (${errorCount})` : errorMessage}
        onSubmit={onSubmit}
        loading={isLoading}
      />
    </Suspense>
  )
}

export default PageAuthImpl
