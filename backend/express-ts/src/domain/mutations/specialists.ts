import { db } from '../../core/db'
import { generateId, type UUID } from '../../core/id'
import { parseISODateToUTC } from '../../core/utils'
import type { AlreadyExistsError, NotFoundError } from '../../http/errors/domain'
import type * as types from '../../http/types'
import type { Res } from '../../lib/res'

export async function createSpecialist(
  args: types.api.specialists.createSpecialist.body,
): Promise<Res<types.schemas.Id, AlreadyExistsError | NotFoundError>> {
  const exists = await db.specialists.findUnique({
    where: { email: args.email },
  })

  if (exists) {
    return { ok: false, error: { kind: 'already exists', resource: 'specialist', key: 'email' } }
  }

  if (args.services.length > 0) {
    const serviceNamesCount = await db.service_names.count({
      where: { id: { in: args.services.map((s) => s.serviceNameId) } },
    })

    if (serviceNamesCount !== args.services.length) {
      return { ok: false, error: { kind: 'not found', resource: 'service_name' } }
    }
  }

  const row = await db.$transaction(async (tx) => {
    const row = await tx.specialists.create({
      data: {
        id: generateId(),
        birthdate: parseISODateToUTC(args.birthdate)!,
        cpf: args.cpf,
        email: args.email,
        name: args.name,
        phone: args.phone,
        cnpj: args.cnpj,
      },
    })

    await tx.services.createMany({
      data: args.services.map((s) => ({
        id: generateId(),
        service_name_id: s.serviceNameId,
        price: s.price,
        duration: s.duration,
        specialist_id: row.id,
      })),
    })

    return row
  })

  return { ok: true, value: { id: row.id } }
}

export async function updateSpecialist(
  specialistId: UUID,
  args: types.api.specialists.updateSpecialist.body,
): Promise<Res<types.schemas.Id, AlreadyExistsError | NotFoundError>> {
  const exists = await db.specialists.findUnique({
    where: { email: args.email },
  })

  if (exists && exists.id !== specialistId) {
    return { ok: false, error: { kind: 'already exists', resource: 'specialist', key: 'email' } }
  }

  const row = await db.specialists.update({
    where: { id: specialistId },
    data: {
      birthdate: parseISODateToUTC(args.birthdate)!,
      cpf: args.cpf,
      email: args.email,
      name: args.name,
      phone: args.phone,
      cnpj: args.cnpj,
    },
  })

  if (!row) {
    return { ok: false, error: { kind: 'not found', resource: 'specialization' } }
  }

  return { ok: true, value: { id: row.id } }
}

export async function deleteSpecialist(specialistId: UUID): Promise<Res<types.schemas.Id, NotFoundError>> {
  const row = await db.specialists.delete({
    where: { id: specialistId },
  })
  if (!row) {
    return { ok: false, error: { kind: 'not found', resource: 'specialist' } }
  }
  return { ok: true, value: { id: row.id } }
}
