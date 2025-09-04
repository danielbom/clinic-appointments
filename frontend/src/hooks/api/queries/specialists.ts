import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { useApi } from '../../../context/ApiContext'
import { SpecialistsCountAllQuery, SpecialistsGetAllQuery } from '../../../lib/api'

type UseSpecialistQuery = {
  id: string
  enabled?: boolean
}

export function useSpecialistQuery({ id, enabled }: UseSpecialistQuery) {
  const api = useApi()
  return useQuery({
    queryKey: ['#specialists', id],
    queryFn: async () => {
      const response = await api.specialists.getById(id)
      return response.data
    },
    enabled: !!id && enabled,
  })
}

type UseSpecialistServicesQuery = {
  id: string
  enabled?: boolean
}

export function useSpecialistServicesQuery({ id, enabled }: UseSpecialistServicesQuery) {
  const api = useApi()
  return useQuery({
    queryKey: ['#specialists', id, '#specializations', '#services'],
    staleTime: 0,
    queryFn: async () => {
      // TODO: Refactor the backend to return the services in the same query
      const [responseSpecializations, responseServices] = await Promise.all([
        api.specialists.getSpecializations(id),
        api.specialists.getServices(id),
      ])
      const specializations = responseSpecializations.data ?? []
      const services = responseServices.data ?? []
      return { specializations, services }
    },
    select: ({ specializations, services }) => {
      const result = specializations.map((it) => ({
        id: it.id,
        name: it.name,
        services: services
          .filter((service) => service.specializationId === it.id)
          .map((service) => ({
            id: service.id,
            serviceNameId: service.serviceNameId,
            serviceName: service.serviceName,
            price: service.price,
            duration: service.duration,
          })),
      }))
      return result
    },
    enabled: !!id && enabled !== false,
  })
}

type UseSpecialistListQuery = {
  params: SpecialistsGetAllQuery
  enabled?: boolean
}

export function useSpecialistListQuery({ params: p, enabled }: UseSpecialistListQuery) {
  const api = useApi()
  return useQuery({
    queryKey: ['#specialists', p.page, p.pageSize, p.name, p.phone, p.cpf],
    maxPages: 10,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const response = await api.specialists.getAll({
        page: (p.page ?? 1) - 1,
        pageSize: p.pageSize,
        name: p.name,
        phone: p.phone,
        cpf: p.cpf,
      })
      return response.data
    },
    enabled,
  })
}

type UseSpecialistCountQuery = {
  params: SpecialistsCountAllQuery
  enabled?: boolean
}

export function useSpecialistCountQuery({ params: p, enabled }: UseSpecialistCountQuery) {
  const api = useApi()
  return useQuery({
    queryKey: ['#specialists', 'count', p.name, p.phone, p.cpf],
    maxPages: 10,
    queryFn: async () => {
      const response = await api.specialists.count({
        name: p.name,
        phone: p.phone,
        cpf: p.cpf,
      })
      return response.data
    },
    enabled,
  })
}

type UseSpecialistAppointments = {
  id: string
  date: string
  enabled?: boolean
}

export function useSpecialistAppointments({ id, date, enabled }: UseSpecialistAppointments) {
  const api = useApi()
  return useQuery({
    queryKey: ['#specialists', id, '#appointments', date],
    staleTime: 1000 * 60 * 2,
    queryFn: async () => {
      const response = await api.specialists.getAppointments(id!, {
        date: date,
      })
      return response.data
    },
    enabled: !!id && enabled !== false,
  })
}
