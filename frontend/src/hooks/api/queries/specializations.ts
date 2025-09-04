import { useQuery } from '@tanstack/react-query'
import { useApi } from '../../../context/ApiContext'

type UseSpecializationQuery = {
  enabled?: boolean
}

export function useSpecializationListQuery({ enabled }: UseSpecializationQuery) {
  const api = useApi()
  return useQuery({
    queryKey: ['#specializations'],
    queryFn: async () => {
      const response = await api.specializations.getAll()
      return response.data
    },
    enabled,
  })
}
