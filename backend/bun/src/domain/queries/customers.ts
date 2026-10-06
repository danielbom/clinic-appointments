import { db } from '../../core/db'

export async function queryCustomer({ customerId }: { customerId: string }) {
  const row = await db.customers.findFirst({
    where: { id: customerId },
  })
  return row
}

export async function queryCustomers({
  page,
  pageSize,
  name,
  cpf,
  phone,
}: {
  page: number
  pageSize: number
  name?: string
  cpf?: string
  phone?: string
}) {
  const rows = await db.customers.findMany({
    where: {
      AND: [
        ...(name ? [{ name: { contains: name, mode: 'insensitive' } as const }] : []), //
        ...(cpf ? [{ cpf }] : []), //
        ...(phone ? [{ phone }] : []), //
      ],
    },
    // orderBy: { name: 'asc' },
    take: pageSize,
    skip: page * pageSize,
  })
  return rows
}

export async function queryCustomersCount({ name, cpf, phone }: { name?: string; cpf?: string; phone?: string }) {
  const count = await db.customers.count({
    where: {
      AND: [
        ...(name ? [{ name: { contains: name, mode: 'insensitive' } as const }] : []), //
        ...(cpf ? [{ cpf }] : []), //
        ...(phone ? [{ phone }] : []), //
      ],
    },
  })
  return count
}
