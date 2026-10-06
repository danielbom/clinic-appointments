import { db } from '../../core/db'
import { generateId, type UUID } from '../../core/id'
import { parseISODateToUTC } from '../../core/utils'
import type { AlreadyExistsError, NotFoundError } from '../../http/errors/domain'
import type * as types from '../../http/types'
import type { Res } from '../../lib/res'

export async function createCustomer(
  args: types.api.customers.createCustomer.body,
): Promise<Res<types.schemas.Id, AlreadyExistsError>> {
  const exists = await db.customers.findUnique({
    where: { phone: args.phone },
  })

  if (exists) {
    return { ok: false, error: { kind: 'already exists', resource: 'customer', key: 'phone' } }
  }

  const row = await db.customers.create({
    data: {
      id: generateId(),
      birthdate: parseISODateToUTC(args.birthdate)!,
      cpf: args.cpf,
      email: args.email,
      name: args.name,
      phone: args.phone,
    },
  })
  return { ok: true, value: { id: row.id } }
}

export async function updateCustomer(
  customerId: UUID,
  args: types.api.customers.updateCustomer.body,
): Promise<Res<types.schemas.Id, AlreadyExistsError | NotFoundError>> {
  const exists = await db.customers.findUnique({
    where: { phone: args.phone },
  })

  if (exists && exists.id !== customerId) {
    return { ok: false, error: { kind: 'already exists', resource: 'customer', key: 'phone' } }
  }

  const row = await db.customers.update({
    where: { id: customerId },
    data: {
      name: args.name,
      email: args.email,
      phone: args.phone,
      birthdate: parseISODateToUTC(args.birthdate)!,
      cpf: args.cpf,
    },
  })

  if (!row) {
    return { ok: false, error: { kind: 'not found', resource: 'customer' } }
  }

  return { ok: true, value: { id: row.id } }
}

export async function deleteCustomer(customerId: UUID): Promise<Res<types.schemas.Id, NotFoundError>> {
  const row = await db.customers.delete({
    where: { id: customerId },
  })
  if (!row) {
    return { ok: false, error: { kind: 'not found', resource: 'customer' } }
  }
  return { ok: true, value: { id: row.id } }
}
