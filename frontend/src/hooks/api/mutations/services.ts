import { message } from 'antd'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useApi } from '../../../context/ApiContext'
import { ServicesCreateBody, ServicesUpdateBody } from '../../../lib/api'
import { invalidateQueries } from '../utils'

export function useServiceCreate() {
  const queryClient = useQueryClient()
  const api = useApi()
  return useMutation({
    mutationKey: ['#services', 'create'],
    mutationFn: async (values: ServicesCreateBody) => {
      const response = await api.services.create(values)
      return response.data
    },
    onSuccess: () => {
      message.success('Serviço registrado!')
      invalidateQueries(queryClient, '#services')
    },
  })
}

export function useServiceUpdate() {
  const queryClient = useQueryClient()
  const api = useApi()
  return useMutation({
    mutationKey: ['#services', 'create'],
    mutationFn: async ({ id, body }: { id: string; body: ServicesUpdateBody }) => {
      const response = await api.services.update(id, body)
      return response.data
    },
    onSuccess: () => {
      message.success('Serviço atualizado!')
      invalidateQueries(queryClient, '#services')
    },
    onError: (error) => {
      message.error('Falha durante a atualização')
      console.error(error)
    },
  })
}

export function useServiceDelete() {
  const queryClient = useQueryClient()
  const api = useApi()
  return useMutation({
    mutationKey: ['#services', 'delete'],
    mutationFn: async (id: string) => {
      const response = await api.services.delete(id)
      return response.data
    },
    onSuccess: () => {
      message.success('Serviço deletado!')
      invalidateQueries(queryClient, '#services')
    },
    onError: (error) => {
      message.error('Falha durante a remoção')
      console.error(error)
    },
  })
}

export function useServiceDeleteAll() {
  const queryClient = useQueryClient()
  const api = useApi()
  return useMutation({
    mutationKey: ['#services', 'delete-all'],
    mutationFn: async (ids: string[]) => {
      const results = await Promise.allSettled(ids.map((id) => api.services.delete(id)))
      return results
    },
    onSuccess: () => {
      invalidateQueries(queryClient, '#services')
    },
  })
}
