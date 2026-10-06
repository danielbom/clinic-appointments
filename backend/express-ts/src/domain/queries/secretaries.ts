import { db } from '../../core/db'

export async function querySecretary({ secretaryId }: { secretaryId: string }) {
  const row = await db.secretaries.findFirst({
    where: { id: secretaryId },
  })
  return row
}

export async function querySecretaries({
  page,
  pageSize,
  name,
  cpf,
  cnpj,
  phone,
}: {
  page: number
  pageSize: number
  name?: string
  cpf?: string
  cnpj?: string
  phone?: string
}) {
  const rows = await db.secretaries.findMany({
    where: {
      AND: [
        ...(name ? [{ name: { contains: name, mode: 'insensitive' } as const }] : []), //
        ...(cpf ? [{ cpf }] : []), //
        ...(cnpj ? [{ cnpj }] : []), //
        ...(phone ? [{ phone }] : []), //
      ],
    },
    orderBy: { name: 'asc' },
    take: pageSize,
    skip: page * pageSize,
  })
  return rows
}

export async function querySecretariesCount({
  name,
  cpf,
  cnpj,
  phone,
}: {
  name?: string
  cpf?: string
  cnpj?: string
  phone?: string
}) {
  const count = await db.secretaries.count({
    where: {
      AND: [
        ...(name ? [{ name: { contains: name, mode: 'insensitive' } as const }] : []), //
        ...(cpf ? [{ cpf }] : []), //
        ...(cnpj ? [{ cnpj }] : []), //
        ...(phone ? [{ phone }] : []), //
      ],
    },
  })
  return count
}
