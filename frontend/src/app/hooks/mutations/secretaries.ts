import { message } from 'antd'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useApi } from '../../../context/ApiContext'
import { SecretariesCreateBody, SecretariesUpdateBody } from '../../../lib/api'
import { invalidateQueries } from '../utils'

export function useSecretaryCreate() {
  const queryClient = useQueryClient()
  const api = useApi()
  return useMutation({
    mutationKey: ['#secretaries', 'create'],
    async mutationFn(values: SecretariesCreateBody) {
      const response = await api.secretaries.create(values)
      return response.data
    },
    onSuccess() {
      message.success('Secretário registrado!')
      invalidateQueries(queryClient, '#secretaries')
    },
  })
}

export function useSecretaryUpdate() {
  const queryClient = useQueryClient()
  const api = useApi()
  return useMutation({
    mutationKey: ['#secretaries', 'update'],
    async mutationFn({ id, body }: { id: string; body: SecretariesUpdateBody }) {
      const response = await api.secretaries.update(id, body)
      return response.data
    },
    onSuccess() {
      message.success('Secretário atualizado!')
      invalidateQueries(queryClient, '#secretaries')
    },
    onError(error) {
      message.error('Falha durante a atualização')
      console.error(error)
    },
  })
}

export function useSecretaryDelete() {
  const queryClient = useQueryClient()
  const api = useApi()
  return useMutation({
    mutationKey: ['#secretaries', 'delete'],
    async mutationFn(id: string) {
      const response = await api.secretaries.delete(id)
      return response.data
    },
    onSuccess() {
      message.success('Secretário deletado!')
      invalidateQueries(queryClient, '#secretaries')
    },
    onError(error) {
      message.error('Falha durante a remoção')
      console.error(error)
    },
  })
}

export function useSecretaryDeleteAll() {
  const queryClient = useQueryClient()
  const api = useApi()
  return useMutation({
    mutationKey: ['#secretaries', 'delete-all'],
    async mutationFn(ids: string[]) {
      const results = await Promise.allSettled(ids.map((id) => api.secretaries.delete(id)))
      return results
    },
    onSuccess() {
      invalidateQueries(queryClient, '#secretaries')
    },
  })
}
