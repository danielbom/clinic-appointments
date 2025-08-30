import { createContext, useContext, useEffect } from 'react'
import axios, { AxiosResponse } from 'axios'
import { message } from 'antd'

import config from '../config'
import { Api, Config } from '../lib/api'
import isAxiosError from '../lib/axios/isAxiosError'
// import { ApiFake } from '../lib/api-fake'

export const ApiContext = createContext<Api>(null as unknown as Api)

const instance = axios.create({
  baseURL: config.api.baseURL,
})

const api = new Api(new Config(instance))

export function ApiProvider({ children }: { children: React.ReactNode }) {
  // TODO: Should I handle all errors here or in each api request?
  // handle all `Network Error`
  useEffect(() => {
    const id = api._config.instance.interceptors.response.use(
      (value) => value,
      (error) => {
        if (isAxiosError(error)) {
          if (error.message === 'Network Error') {
            message.error('Sem conexão com a internet.')
          }
        }
        throw error
      },
    )
    return () => {
      api._config.instance.interceptors.response.eject(id)
    }
  }, [])
  // Log responses
  useEffect(() => {
    if (import.meta.env.PROD) return
    function logResponse(response: AxiosResponse) {
      // https://github.com/horprogs/react-query/blob/7e69a716054958721288d34a26b30427c257aa3b/src/utils/mockApi.ts#L37
      if (!response) return
      const method = response.config.method?.toUpperCase() || 'UNKNOWN'
      const baseURL = response.config.baseURL
      const url = response.config.url
      if (!url) return
      const status = response.status
      console.groupCollapsed(`=> ${method} ${baseURL}${url} ${status}`)
      if (response.config.params) console.log('Params:', response.config.params)
      if (response.config.data) console.log('Body:', response.config.data)
      if (response.data) console.log('Response:', response.data)
      console.groupEnd()
    }
    const id = api._config.instance.interceptors.response.use(
      (response) => {
        logResponse(response)
        return response
      },
      (error) => {
        logResponse(error.response)
        throw error
      },
    )
    return () => {
      api._config.instance.interceptors.response.eject(id)
    }
  }, [])

  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>
}

export function useApi() {
  return useContext(ApiContext)
}
