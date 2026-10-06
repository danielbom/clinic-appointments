import { db } from '../../core/db'

export async function queryServiceGroups() {
  const rows = await db.specializations.findMany({
    include: { service_names: {} },
  })
  return rows
}
