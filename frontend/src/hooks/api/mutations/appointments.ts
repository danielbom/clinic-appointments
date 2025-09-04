import { message } from 'antd'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useApi } from '../../../context/ApiContext'
import { AppointmentsCreateBody, AppointmentsUpdateBody } from '../../../lib/api'
import { invalidateQueries } from '../utils'

export function useAppointmentsCreate() {
  const queryClient = useQueryClient()
  const api = useApi()
  return useMutation({
    mutationKey: ['#appointments', 'create'],
    mutationFn: async (values: AppointmentsCreateBody) => {
      const response = await api.appointments.create(values)
      return response.data
    },
    onSuccess: () => {
      message.success('Agendamento registrado!')
      invalidateQueries(queryClient, '#appointments')
    },
  })
}

export function useAppointmentsUpdate() {
  const queryClient = useQueryClient()
  const api = useApi()
  return useMutation({
    mutationKey: ['#appointments', 'update'],
    mutationFn: async ({ id, data }: { id: string; data: AppointmentsUpdateBody }) => {
      const response = await api.appointments.update(id, data)
      return response.data
    },
    onSuccess: () => {
      message.success('Agendamento atualizado!')
      invalidateQueries(queryClient, '#appointments')
    },
    onError: (error) => {
      message.error('Falha durante a atualização')
      console.error(error)
    },
  })
}

export function useAppointmentsDelete() {
  const queryClient = useQueryClient()
  const api = useApi()
  return useMutation({
    mutationKey: ['#appointments', 'delete'],
    mutationFn: async (id: string) => {
      const response = await api.appointments.delete(id)
      return response.data
    },
    onSuccess: () => {
      message.success('Agendamento deletado!')
      invalidateQueries(queryClient, '#appointments')
    },
    onError: (error) => {
      message.error('Falha durante a remoção')
      console.error(error)
    },
  })
}

export function useAppointmentsDeleteAll() {
  const queryClient = useQueryClient()
  const api = useApi()
  return useMutation({
    mutationKey: ['#appointments', 'delete-all'],
    mutationFn: async (ids: string[]) => {
      const results = await Promise.allSettled(ids.map((id) => api.appointments.delete(id)))
      return results
    },
    onSuccess: () => {
      invalidateQueries(queryClient, '#appointments')
    },
  })
}
