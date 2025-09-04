import { useQuery } from '@tanstack/react-query'
import { useApi } from '../../../context/ApiContext'

type UseServiceAvailableQuery = {
  id: string
  enabled?: boolean
}

export function useServiceAvailableQuery({ id, enabled }: UseServiceAvailableQuery) {
  const api = useApi()
  return useQuery({
    queryKey: ['#services-available', id],
    queryFn: async () => {
      const response = await api.servicesAvailable.getById(id)
      return response.data
    },
    enabled: !!id && enabled,
  })
}

type UseServicesAvailableGroupQuery = {
  enabled?: boolean
}

export function useServicesAvailableGroupQuery({ enabled }: UseServicesAvailableGroupQuery) {
  const api = useApi()
  return useQuery({
    queryKey: ['#services-available'],
    maxPages: 10,
    queryFn: async () => {
      const response = await api.servicesAvailable.getAll()
      return response.data
    },
    enabled,
  })
}
