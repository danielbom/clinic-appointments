import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { useApi } from '../../../context/ApiContext'
import { CustomersCountAllQuery, CustomersGetAllQuery } from '../../../lib/api'

type UseCustomerQuery = {
  id: string
  enabled?: boolean
}

export function useCustomerQuery({ id, enabled }: UseCustomerQuery) {
  const api = useApi()
  return useQuery({
    queryKey: ['#customers', id],
    queryFn: async () => {
      const response = await api.customers.getById(id)
      return response.data
    },
    enabled: !!id && enabled,
  })
}

type UseCustomersListQuery = {
  params: CustomersGetAllQuery
  enabled?: boolean
}

export function useCustomersListQuery({ params: p, enabled }: UseCustomersListQuery) {
  const api = useApi()
  return useQuery({
    queryKey: ['#customers', p.page, p.pageSize, p.name, p.phone, p.cpf],
    maxPages: 10,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const response = await api.customers.getAll({
        page: (p.page || 1) - 1,
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

type UseCustomersCountQuery = {
  params: CustomersCountAllQuery
  enabled?: boolean
}

export function useCustomersCountQuery({ params: p, enabled }: UseCustomersCountQuery) {
  const api = useApi()
  return useQuery({
    queryKey: ['#customers', 'count', p.name, p.phone, p.cpf],
    queryFn: async () => {
      const response = await api.customers.count({
        name: p.name,
        phone: p.phone,
        cpf: p.cpf,
      })
      return response.data
    },
    enabled,
  })
}
