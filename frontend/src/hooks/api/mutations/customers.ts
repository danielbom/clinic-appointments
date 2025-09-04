import { message } from 'antd'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useApi } from '../../../context/ApiContext'
import { CustomersCreateBody, CustomersUpdateBody } from '../../../lib/api'
import { invalidateQueries } from '../utils'

export function useCustomerCreate() {
  const queryClient = useQueryClient()
  const api = useApi()
  return useMutation({
    mutationKey: ['#customers', 'create'],
    mutationFn: async (values: CustomersCreateBody) => {
      const response = await api.customers.create(values)
      return response.data
    },
    onSuccess() {
      message.success('Cliente registrado!')
      invalidateQueries(queryClient, '#customers')
    },
  })
}

export function useCustomerUpdate() {
  const queryClient = useQueryClient()
  const api = useApi()
  return useMutation({
    mutationKey: ['#customers', 'update'],
    mutationFn: async ({ id, body }: { id: string; body: CustomersUpdateBody }) => {
      const response = await api.customers.update(id, body)
      return response.data
    },
    onSuccess: () => {
      message.success('Cliente atualizado!')
      invalidateQueries(queryClient, '#customers')
    },
    onError: (error) => {
      message.error('Falha durante a atualização')
      console.error(error)
    },
  })
}

export function useCustomerDelete() {
  const queryClient = useQueryClient()
  const api = useApi()
  return useMutation({
    mutationKey: ['#customers', 'delete'],
    mutationFn: async (id: string) => {
      const response = await api.customers.delete(id)
      return response.data
    },
    onSuccess: () => {
      message.success('Cliente deletado!')
      invalidateQueries(queryClient, '#customers')
    },
    onError: (error) => {
      message.error('Falha durante a remoção')
      console.error(error)
    },
  })
}

export function useCustomerDeleteAll() {
  const queryClient = useQueryClient()
  const api = useApi()
  return useMutation({
    mutationKey: ['#customers', 'delete-all'],
    mutationFn: async (ids: string[]) => {
      const results = await Promise.allSettled(ids.map((id) => api.customers.delete(id)))
      return results
    },
    onSuccess() {
      invalidateQueries(queryClient, '#customers')
    },
  })
}
