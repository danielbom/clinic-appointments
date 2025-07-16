import { useMemo } from 'react'
import { ServiceAvailable } from '../types'

export default function useTableToGroupServices(data: ServiceAvailable[]) {
  return useMemo(() => {
    const groups = new Map<string, { id: string; name: string; services: Array<ServiceAvailable> }>()
    data.forEach((item) => {
      const group = groups.get(item.specializationId) ?? {
        id: item.specializationId,
        name: item.specialization,
        services: [],
      }
      group.services.push(item)
      groups.set(item.specializationId, group)
    })
    return Array.from(groups.values())
  }, [data])
}
