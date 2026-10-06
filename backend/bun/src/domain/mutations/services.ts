import { db } from '../../core/db'
import { generateId, type UUID } from '../../core/id'
import type { AlreadyExistsError, NotFoundError } from '../../http/errors/domain'
import type * as types from '../../http/types'
import type { Res } from '../../lib/res'

export async function createService(
  args: types.api.services.createService.body,
): Promise<Res<types.schemas.Id, AlreadyExistsError>> {
  const exists = await db.services.findUnique({
    where: {
      service_name_id_specialist_id: {
        service_name_id: args.serviceNameId,
        specialist_id: args.specialistId,
      },
    },
  })

  if (exists) {
    return { ok: false, error: { kind: 'already exists', resource: 'service', key: 'specialist_id,service_name_id' } }
  }

  const row = await db.services.create({
    data: {
      id: generateId(),
      service_name_id: args.serviceNameId,
      specialist_id: args.specialistId,
      price: args.price,
      duration: args.duration,
    },
  })
  return { ok: true, value: { id: row.id } }
}

export async function updateService(
  serviceId: UUID,
  args: types.api.services.updateService.body,
): Promise<Res<types.schemas.Id, NotFoundError>> {
  const row = await db.services.update({
    where: { id: serviceId },
    data: {
      duration: args.duration,
      price: args.price,
    },
  })

  if (!row) {
    return { ok: false, error: { kind: 'not found', resource: 'specialization' } }
  }

  return { ok: true, value: { id: row.id } }
}

export async function deleteService(serviceId: UUID): Promise<Res<types.schemas.Id, NotFoundError>> {
  const row = await db.services.delete({
    where: { id: serviceId },
  })
  if (!row) {
    return { ok: false, error: { kind: 'not found', resource: 'service' } }
  }
  return { ok: true, value: { id: row.id } }
}
