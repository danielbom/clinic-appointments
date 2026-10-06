import { db } from '../../core/db'

export async function querySpecializations() {
  const rows = await db.specializations.findMany({
    orderBy: { name: 'asc' },
  })
  return rows
}
