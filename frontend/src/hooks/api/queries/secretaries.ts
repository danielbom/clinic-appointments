import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { useApi } from '../../../context/ApiContext'
import { SecretariesCountAllQuery, SecretariesGetAllQuery } from '../../../lib/api'

type UseSecretaryQuery = {
  id: string
  enabled?: boolean
}

export function useSecretaryQuery({ id, enabled }: UseSecretaryQuery) {
  const api = useApi()
  return useQuery({
    queryKey: ['#secretaries', id],
    queryFn: async () => {
      const response = await api.secretaries.getById(id)
      return response.data
    },
    enabled: !!id && enabled,
  })
}

type UseSecretariesListQuery = {
  params: SecretariesGetAllQuery
  enabled?: boolean
}

export function useSecretariesListQuery({ params: p, enabled }: UseSecretariesListQuery) {
  const api = useApi()
  return useQuery({
    queryKey: ['#secretaries', p.page, p.pageSize, p.cpf, p.cnpj, p.name, p.phone],
    maxPages: 10,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const response = await api.secretaries.getAll({
        page: (p.page || 1) - 1,
        pageSize: p.pageSize,
        cpf: p.cpf,
        cnpj: p.cnpj,
        name: p.name,
        phone: p.phone,
      })
      return response.data
    },
    enabled,
  })
}

type UseSecretariesCountQuery = {
  params: SecretariesCountAllQuery
  enabled?: boolean
}

export function useSecretariesCountQuery({ params: p, enabled }: UseSecretariesCountQuery) {
  const api = useApi()
  return useQuery({
    queryKey: ['#secretaries', 'count', p.cpf, p.cnpj, p.name, p.phone],
    queryFn: async () => {
      const response = await api.secretaries.count({
        cpf: p.cpf,
        cnpj: p.cnpj,
        name: p.name,
        phone: p.phone,
      })
      return response.data
    },
    enabled,
  })
}
