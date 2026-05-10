-- name: CreateServiceName :one
INSERT INTO "service_names" ("id", "name", "specialization_id")
VALUES ( sqlc.arg('id')
       , sqlc.arg('name')
       , sqlc.arg('specializationId')
       )
RETURNING "id";

-- name: UpdateServiceName :one
UPDATE "service_names"
SET
  "name" = sqlc.arg('name')
WHERE "id" = sqlc.arg('id')
RETURNING "id";

-- name: GetServiceNameByName :one
SELECT "id", "name", "specialization_id"
FROM "service_names"
WHERE "name" = sqlc.arg('serviceName');

-- name: GetServiceNameByID :one
SELECT "id", "name", "specialization_id"
FROM "service_names"
WHERE "id" = sqlc.arg('serviceNameId');

-- name: ListServiceNames :many
SELECT "id", "name", "specialization_id"
FROM "service_names"
ORDER BY "name" ASC;

-- name: DeleteServiceNameByID :execrows
DELETE FROM "service_names"
WHERE "id" = sqlc.arg('serviceNameId');
