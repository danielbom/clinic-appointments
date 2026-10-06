import { db } from '../../core/db'
import { generateId, type UUID } from '../../core/id'
import type { AlreadyExistsError, NotFoundError } from '../../http/errors/domain'
import type * as types from '../../http/types'
import type { Res } from '../../lib/res'

export async function createSpecialization(
  args: types.api.specializations.createSpecialization.body,
): Promise<Res<types.schemas.Id, AlreadyExistsError>> {
  const exists = await db.specializations.findUnique({
    where: { name: args.name },
  })

  if (exists) {
    return { ok: false, error: { kind: 'already exists', resource: 'specialization', key: 'name' } }
  }

  const row = await db.specializations.create({
    data: {
      id: generateId(),
      name: args.name,
    },
  })

  return { ok: true, value: { id: row.id } }
}

export async function updateSpecialization(
  specializationId: UUID,
  args: types.api.specializations.updateSpecialization.body,
): Promise<Res<types.schemas.Id, AlreadyExistsError | NotFoundError>> {
  const exists = await db.specializations.findUnique({
    where: { name: args.name },
  })

  if (exists && exists.id !== specializationId) {
    return { ok: false, error: { kind: 'already exists', resource: 'specialization', key: 'name' } }
  }

  const row = await db.specializations.update({
    where: { id: specializationId },
    data: { name: args.name },
  })

  if (!row) {
    return { ok: false, error: { kind: 'not found', resource: 'specialization' } }
  }

  return { ok: true, value: { id: row.id } }
}

export async function deleteSpecialization(specializationId: UUID): Promise<Res<types.schemas.Id, NotFoundError>> {
  const row = await db.specializations.delete({
    where: { id: specializationId },
  })
  if (!row) {
    return { ok: false, error: { kind: 'not found', resource: 'specialization' } }
  }
  return { ok: true, value: { id: row.id } }
}
