import { useQuery } from '@tanstack/react-query'
import { useApi } from '../../../context/ApiContext'

type UseServiceGroups = {
  enabled?: boolean
}

export function useServiceGroups({ enabled }: UseServiceGroups) {
  const api = useApi()
  return useQuery({
    queryKey: ['#services-available', 'groups'],
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      const response = await api.serviceGroups.getAll()
      return response.data
    },
    enabled,
  })
}
