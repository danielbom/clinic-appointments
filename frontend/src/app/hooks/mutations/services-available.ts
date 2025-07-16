import { message } from 'antd'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useApi } from '../../../context/ApiContext'
import { ServiceAvailableCreateBody, ServiceAvailableUpdateBody } from '../../../lib/api'
import { invalidateQueries } from '../utils'

export function useServiceAvailableCreate() {
  const queryClient = useQueryClient()
  const api = useApi()
  return useMutation({
    mutationKey: ['#services-available', 'create'],
    async mutationFn(values: ServiceAvailableCreateBody) {
      const response = await api.servicesAvailable.create(values)
      return response.data
    },
    onSuccess() {
      message.success('Serviço registrado!')
      invalidateQueries(queryClient, '#services-available')
    },
  })
}

export function useServiceAvailableUpdate() {
  const queryClient = useQueryClient()
  const api = useApi()
  return useMutation({
    mutationKey: ['#services-available', 'update'],
    async mutationFn({ id, body }: { id: string; body: ServiceAvailableUpdateBody }) {
      const response = await api.servicesAvailable.update(id, body)
      return response.data
    },
    onSuccess() {
      message.success('Serviço atualizado!')
      invalidateQueries(queryClient, '#services-available')
    },
    onError: (error) => {
      message.error('Falha durante a atualização')
      console.error(error)
    },
  })
}

export function useServiceAvailableDelete() {
  const queryClient = useQueryClient()
  const api = useApi()
  return useMutation({
    mutationKey: ['#services-available', 'delete'],
    async mutationFn(id: string) {
      const response = await api.servicesAvailable.delete(id)
      return response.data
    },
    onSuccess() {
      message.success('Serviço deletado!')
      invalidateQueries(queryClient, '#services-available')
    },
    onError: (error) => {
      message.error('Falha durante a remoção')
      console.error(error)
    },
  })
}
export function useServiceAvailableDeleteAll() {
  const queryClient = useQueryClient()
  const api = useApi()
  return useMutation({
    mutationKey: ['#services-available', 'delete-all'],
    async mutationFn(ids: string[]) {
      const results = await Promise.allSettled(ids.map((id) => api.servicesAvailable.delete(id)))
      return results
    },
    onSuccess() {
      invalidateQueries(queryClient, '#services-available')
    },
  })
}
