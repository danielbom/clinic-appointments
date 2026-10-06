import { db } from '../../core/db'

export async function queryServiceAvailable({ serviceAvailableId }: { serviceAvailableId: string }) {
  const row = await db.service_names.findUnique({
    where: { id: serviceAvailableId },
    include: {
      specializations: {},
    },
  })
  return row
}

export async function queryServiceAvailables({ page, pageSize }: { page: number; pageSize: number }) {
  const rows = await db.specializations.findMany({
    orderBy: { name: 'asc' },
    include: {
      service_names: {},
    },
    take: pageSize,
    skip: page * pageSize,
  })
  return rows
}
