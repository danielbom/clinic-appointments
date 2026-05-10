-- name: CreateSpecialization :one
INSERT INTO "specializations" ("id", "name")
VALUES ( sqlc.arg('id')
       , sqlc.arg('name')
       )
RETURNING "id";

-- name: UpdateSpecialization :one
UPDATE "specializations"
SET 
  "name" = sqlc.arg('name')
WHERE "id" = sqlc.arg('id')
RETURNING "id";

-- name: GetSpecializationByID :one
SELECT "id", "name"
FROM "specializations" 
WHERE "id" = sqlc.arg('specializationId');

-- name: GetSpecializationByName :one
SELECT "id", "name"
FROM "specializations" 
WHERE "name" = sqlc.arg('specializationName');

-- name: ListSpecializations :many
SELECT "id", "name"
FROM "specializations"
ORDER BY "name" ASC;

-- name: ListSpecializationsBySpecialistID :many
SELECT "sp"."id", "sp"."name"
FROM "specializations" "sp"
WHERE "sp"."id" IN (
  SELECT "sn"."specialization_id" 
  FROM "services" "s" 
  JOIN "service_names" "sn" ON "sn"."id" = "s"."service_name_id"
  WHERE "s"."specialist_id" = sqlc.arg('specialistId')
)
ORDER BY "name" ASC;

-- name: DeleteSpecializationByID :execrows
DELETE FROM "specializations"
WHERE "id" = sqlc.arg('specializationId');
