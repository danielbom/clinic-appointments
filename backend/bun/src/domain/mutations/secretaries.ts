import { db } from '../../core/db'
import { generateId, type UUID } from '../../core/id'
import { hashPassword } from '../../core/password'
import { parseISODateToUTC } from '../../core/utils'
import type { AlreadyExistsError, NotFoundError } from '../../http/errors/domain'
import type * as types from '../../http/types'
import type { Res } from '../../lib/res'

export async function createSecretary(
  args: types.api.secretaries.createSecretary.body,
): Promise<Res<types.schemas.Id, AlreadyExistsError>> {
  const exists = await db.secretaries.findUnique({
    where: { email: args.email },
  })

  if (exists) {
    return { ok: false, error: { kind: 'already exists', resource: 'secretary', key: 'email' } }
  }

  const row = await db.secretaries.create({
    data: {
      id: generateId(),
      birthdate: parseISODateToUTC(args.birthdate)!,
      cpf: args.cpf,
      email: args.email,
      name: args.name,
      password: await hashPassword(args.password),
      phone: args.phone,
      cnpj: args.cnpj,
    },
  })

  return { ok: true, value: { id: row.id } }
}

export async function updateSecretary(
  secretaryId: UUID,
  args: types.api.secretaries.updateSecretary.body,
): Promise<Res<types.schemas.Id, AlreadyExistsError | NotFoundError>> {
  const exists = await db.secretaries.findUnique({
    where: { email: args.email },
  })

  if (exists && exists.id !== secretaryId) {
    return { ok: false, error: { kind: 'already exists', resource: 'secretary', key: 'email' } }
  }

  const row = await db.secretaries.update({
    where: { id: secretaryId },
    data: {
      name: args.name,
      email: args.email,
      phone: args.phone,
      birthdate: parseISODateToUTC(args.birthdate)!,
      cpf: args.cpf,
      cnpj: args.cnpj,
      password: args.password ? await hashPassword(args.password) : undefined,
    },
  })

  if (!row) {
    return { ok: false, error: { kind: 'not found', resource: 'secretary' } }
  }

  return { ok: true, value: { id: row.id } }
}

export async function deleteSecretary(secretaryId: UUID): Promise<Res<types.schemas.Id, NotFoundError>> {
  const row = await db.secretaries.delete({
    where: { id: secretaryId },
  })
  if (!row) {
    return { ok: false, error: { kind: 'not found', resource: 'secretary' } }
  }
  return { ok: true, value: { id: row.id } }
}
