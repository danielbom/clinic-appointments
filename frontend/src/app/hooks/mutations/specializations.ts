import { message } from 'antd'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useApi } from '../../../context/ApiContext'
import { SpecializationsCreateBody, SpecializationsUpdateBody } from '../../../lib/api'
import { invalidateQueries } from '../utils'

export function useSpecializationCreate() {
  const queryClient = useQueryClient()
  const api = useApi()
  return useMutation({
    mutationKey: ['#specializations', 'create'],
    mutationFn: async (values: SpecializationsCreateBody) => {
      const response = await api.specializations.create(values)
      return response.data
    },
    onSuccess: () => {
      message.success('Especialização registrada!')
      invalidateQueries(queryClient, '#specializations')
    },
  })
}

export function useSpecializationUpdate() {
  const queryClient = useQueryClient()
  const api = useApi()
  return useMutation({
    mutationKey: ['#specializations', 'update'],
    mutationFn: async ({ id, body }: { id: string; body: SpecializationsUpdateBody }) => {
      const response = await api.specializations.update(id, body)
      return response.data
    },
    onSuccess: () => {
      message.success('Especialização atualizado!')
      invalidateQueries(queryClient, '#specializations')
    },
    onError: (error) => {
      message.error('Falha durante a atualização')
      console.error(error)
    },
  })
}

export function useSpecializationDelete() {
  const queryClient = useQueryClient()
  const api = useApi()
  return useMutation({
    mutationKey: ['#specializations', 'delete'],
    mutationFn: async (id: string) => {
      const response = await api.specializations.delete(id)
      return response.data
    },
    onSuccess: () => {
      message.success('Especialização deletado!')
      invalidateQueries(queryClient, '#specializations')
    },
    onError: (error) => {
      message.error('Falha durante a remoção')
      console.error(error)
    },
  })
}

export function useSpecializationDeleteAll() {
  const queryClient = useQueryClient()
  const api = useApi()
  return useMutation({
    mutationKey: ['#specializations', 'delete-all'],
    mutationFn: async (ids: string[]) => {
      const results = await Promise.allSettled(ids.map((id) => api.specializations.delete(id)))
      return results
    },
    onSuccess: () => {
      invalidateQueries(queryClient, '#specializations')
    },
  })
}
