import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { useApi } from '../../../context/ApiContext'
import { AppointmentsCountAllQuery, AppointmentsGetAllQuery, AppointmentsGetCalendarQuery } from '../../../lib/api'

type UseAppointmentQuery = {
  id: string
  enabled?: boolean
}

export function useAppointmentQuery({ id, enabled }: UseAppointmentQuery) {
  const api = useApi()
  return useQuery({
    queryKey: ['#appointments', id],
    queryFn: async () => {
      const response = await api.appointments.getById(id)
      return response.data
    },
    enabled: !!id && enabled,
  })
}

type UseAppointmentsListQuery = {
  params: AppointmentsGetAllQuery
  enabled: boolean
}

export function useAppointmentsListQuery({ params: p, enabled }: UseAppointmentsListQuery) {
  const api = useApi()
  return useQuery({
    queryKey: ['#appointments', p.page, p.pageSize, p.startDate, p.endDate, p.serviceName, p.specialist, p.customer],
    maxPages: 10,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const response = await api.appointments.getAll({
        page: (p.page ?? 1) - 1,
        pageSize: p.pageSize,
        customer: p.customer,
        endDate: p.endDate,
        serviceName: p.serviceName,
        specialist: p.specialist,
        startDate: p.startDate,
        status: p.status,
      })
      return response.data
    },
    enabled,
  })
}

type UseAppointmentsCountQuery = {
  params: AppointmentsCountAllQuery
  enabled?: boolean
}

export function useAppointmentsCountQuery({ params: p, enabled }: UseAppointmentsCountQuery) {
  const api = useApi()
  return useQuery({
    queryKey: ['#appointments', 'count', p.startDate, p.endDate, p.serviceName, p.specialist, p.customer],
    queryFn: async () => {
      const response = await api.appointments.count({
        customer: p.customer,
        endDate: p.endDate,
        serviceName: p.serviceName,
        specialist: p.specialist,
        startDate: p.startDate,
        status: p.status,
      })
      return response.data
    },
    enabled,
  })
}

type UseAppointmentsCalendarQuery = {
  params: AppointmentsGetCalendarQuery
  enabled?: boolean
}

export function useAppointmentsCalendarQuery({ params: p, enabled }: UseAppointmentsCalendarQuery) {
  const api = useApi()
  return useQuery({
    queryKey: ['#appointments', 'calendar', p.startDate, p.endDate],
    staleTime: Infinity,
    queryFn: async () => {
      const response = await api.appointments.getCalendar(p)
      return response.data
    },
    enabled,
  })
}

type UseAppointmentsCalendarCountQuery = {
  params: AppointmentsGetCalendarQuery
  enabled?: boolean
}

export function useAppointmentsCalendarCountQuery({ params: p, enabled }: UseAppointmentsCalendarCountQuery) {
  const api = useApi()
  return useQuery({
    queryKey: ['#appointments', 'calendar', 'count', p.startDate, p.endDate],
    staleTime: Infinity,
    queryFn: async () => {
      const response = await api.appointments.getCalendarCount(p)
      return response.data
    },
    enabled,
  })
}
