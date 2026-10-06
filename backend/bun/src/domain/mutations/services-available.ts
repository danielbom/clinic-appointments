import { db } from '../../core/db'
import { generateId, type UUID } from '../../core/id'
import type { AlreadyExistsError, NotFoundError } from '../../http/errors/domain'
import type * as types from '../../http/types'
import type { Res } from '../../lib/res'

export async function createServiceAvailable(
  args: types.api.servicesAvailable.createServiceAvailable.body,
): Promise<Res<types.schemas.Id, AlreadyExistsError | NotFoundError>> {
  if (args.specialization && !args.specializationId) {
    let specialization = await db.specializations.findUnique({
      where: { name: args.specialization },
    })

    if (!specialization) {
      specialization = await db.specializations.create({
        data: {
          id: generateId(),
          name: args.specialization,
        },
      })
    }

    args.specializationId = specialization.id
  }

  {
    const exists = await db.specializations.findUnique({
      where: { id: args.specializationId },
    })

    if (!exists) {
      return { ok: false, error: { kind: 'not found', resource: 'specialization' } }
    }
  }

  const exists = await db.service_names.findUnique({
    where: { name: args.name },
  })

  if (exists) {
    return { ok: false, error: { kind: 'already exists', resource: 'service_name', key: 'name' } }
  }

  const row = await db.service_names.create({
    data: {
      id: generateId(),
      name: args.name,
      specialization_id: args.specializationId!,
    },
  })

  return { ok: true, value: { id: row.id } }
}

export async function updateServiceAvailable(
  serviceAvailableId: UUID,
  args: types.api.servicesAvailable.updateServiceAvailable.body,
): Promise<Res<types.schemas.Id, AlreadyExistsError | NotFoundError>> {
  const exists = await db.service_names.findUnique({
    where: { name: args.name },
  })

  if (exists && exists.id !== serviceAvailableId) {
    return { ok: false, error: { kind: 'already exists', resource: 'service_name', key: 'name' } }
  }

  const row = await db.service_names.update({
    where: { id: serviceAvailableId },
    data: { name: args.name },
  })

  if (!row) {
    return { ok: false, error: { kind: 'not found', resource: 'service_name' } }
  }

  return { ok: true, value: { id: row.id } }
}

export async function deleteServiceAvailable(serviceAvailableId: UUID): Promise<Res<types.schemas.Id, NotFoundError>> {
  const row = await db.service_names.delete({
    where: { id: serviceAvailableId },
  })
  if (!row) {
    return { ok: false, error: { kind: 'not found', resource: 'service_name' } }
  }
  return { ok: true, value: { id: row.id } }
}
