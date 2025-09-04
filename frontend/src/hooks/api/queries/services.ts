import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { useApi } from '../../../context/ApiContext'
import { ServicesGetAllQuery } from '../../../lib/api'

type UseServiceQuery = {
  id: string
  enabled?: boolean
}

export function useServiceQuery({ id, enabled }: UseServiceQuery) {
  const api = useApi()
  return useQuery({
    queryKey: ['#services', id],
    queryFn: async () => {
      const response = await api.services.getById(id)
      return response.data
    },
    enabled: !!id && enabled,
  })
}

type UseServicesListQuery = {
  params: ServicesGetAllQuery
  enabled?: boolean
}

export function useServicesListQuery({ params: p, enabled }: UseServicesListQuery) {
  const api = useApi()
  return useQuery({
    queryKey: ['#services', p.page, p.pageSize, p.service, p.specialist, p.specialization],
    maxPages: 10,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const response = await api.services.getAll({
        page: (p.page || 1) - 1,
        pageSize: p.pageSize,
        service: p.service,
        specialist: p.specialist,
        specialization: p.specialization,
      })
      return response.data
    },
    enabled,
  })
}

type UseServicesCountQuery = {
  params: ServicesGetAllQuery
  enabled?: boolean
}

export function useServicesCountQuery({ params: p, enabled }: UseServicesCountQuery) {
  const api = useApi()
  return useQuery({
    queryKey: ['#services', 'count', p.service, p.specialist, p.specialization],
    queryFn: async () => {
      const response = await api.services.count({
        service: p.service,
        specialist: p.specialist,
        specialization: p.specialization,
      })
      return response.data
    },
    enabled,
  })
}
