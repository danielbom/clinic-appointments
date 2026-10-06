import { db } from '../../core/db'
import type * as models from '../../prisma/models'

export async function queryService({ serviceId }: { serviceId: string }) {
  const row = await db.services.findUnique({
    where: { id: serviceId },
  })
  return row
}

export type ServiceEnriched = models.servicesModel & {
  specialist_name: string
  service_name: string
  specialization_id: string
  specialization_name: string
}

export async function queryServices({
  page,
  pageSize,
  service,
  specialist,
  specialization,
}: {
  page: number
  pageSize: number
  service: string
  specialist: string
  specialization: string
}) {
  const rows = await db.$queryRaw<ServiceEnriched[]>`-- name: ListServicesEnriched :many
SELECT "s"."id", "s"."price", "s"."duration",
       "s"."specialist_id",      "sp"."name" AS "specialist_name",
       "s"."service_name_id",    "sn"."name" AS "service_name",
       "sn"."specialization_id", "sz"."name" AS "specialization_name"
FROM "services" "s"
JOIN "specialists" "sp"       ON "s"."specialist_id" = "sp"."id"
JOIN "service_names" "sn"     ON "s"."service_name_id" = "sn"."id"
JOIN "specializations" "sz"   ON "sn"."specialization_id" = "sz"."id"
WHERE true
   AND (${specialist}::text = ''     OR LOWER(unaccent("sp"."name")) LIKE '%' || LOWER(unaccent(${specialist})) || '%')
   AND (${specialization}::text = '' OR LOWER(unaccent("sz"."name")) LIKE '%' || LOWER(unaccent(${specialization})) || '%')
   AND (${service}::text = ''        OR LOWER(unaccent("sn"."name")) LIKE '%' || LOWER(unaccent(${service})) || '%')
ORDER BY "service_name", "specialist_name"
OFFSET ${page * pageSize}::integer
LIMIT ${pageSize}::integer`
  return rows
}

export async function queryServicesCount({
  service,
  specialist,
  specialization,
}: {
  service: string
  specialist: string
  specialization: string
}) {
  const count = await db.services.count({
    where: {
      AND: [
        ...(service ? [{ service_names: { name: { contains: service } } } as const] : []), //
        ...(specialist ? [{ specialists: { name: { contains: specialist } } } as const] : []), //
        ...(specialization
          ? [{ service_names: { specializations: { name: { contains: specialization } } } } as const]
          : []), //
      ],
    },
  })
  return count
}
