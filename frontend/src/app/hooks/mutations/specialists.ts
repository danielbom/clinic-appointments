import { message } from 'antd'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useApi } from '../../../context/ApiContext'
import { SpecialistsCreateBody } from '../../../lib/api'
import { invalidateQueries } from '../utils'

export function useSpecialistCreate() {
  const queryClient = useQueryClient()
  const api = useApi()
  return useMutation({
    mutationKey: ['#specialists', 'create'],
    async mutationFn(values: SpecialistsCreateBody) {
      const response = await api.specialists.create(values)
      return response.data
    },
    onSuccess() {
      message.success('Especialista registrado!')
      invalidateQueries(queryClient, '#specialists')
    },
  })
}

export function useSpecialistUpdate() {
  const queryClient = useQueryClient()
  const api = useApi()
  return useMutation({
    mutationKey: ['#specialists', 'update'],
    async mutationFn({ id, body }: { id: string; body: SpecialistsCreateBody }) {
      const response = await api.specialists.update(id, body)
      return response.data
    },
    onSuccess() {
      message.success('Especialista atualizado!')
      invalidateQueries(queryClient, '#specialists')
    },
    onError: (error) => {
      message.error('Falha durante a atualização')
      console.error(error)
    },
  })
}

export function useSpecialistDelete() {
  const queryClient = useQueryClient()
  const api = useApi()
  return useMutation({
    mutationKey: ['#specialists', 'delete'],
    async mutationFn(id: string) {
      const response = await api.specialists.delete(id)
      return response.data
    },
    onSuccess() {
      message.success('Especialista deletado!')
      invalidateQueries(queryClient, '#specialists')
    },
    onError: (error) => {
      message.error('Falha durante a remoção')
      console.error(error)
    },
  })
}

export function useSpecialistDeleteAll() {
  const queryClient = useQueryClient()
  const api = useApi()
  return useMutation({
    mutationKey: ['#specialists', 'delete-all'],
    async mutationFn(ids: string[]) {
      const results = await Promise.allSettled(ids.map((id) => api.specialists.delete(id)))
      return results
    },
    onSuccess() {
      message.success('Especialistas deletado!')
      invalidateQueries(queryClient, '#specialists')
    },
  })
}
