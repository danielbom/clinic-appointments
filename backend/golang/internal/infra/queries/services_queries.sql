-- name: CreateService :one
INSERT INTO services ("id", "service_name_id", "specialist_id", "price", "duration")
VALUES ( sqlc.arg('id')
       , sqlc.arg('serviceNameId')
       , sqlc.arg('specialistId')
       , sqlc.arg('price')
       , sqlc.arg('duration')
       )
RETURNING "id";

-- name: UpdateService :one
UPDATE "services" 
SET
    "price"    = sqlc.arg('price'),
    "duration" = sqlc.arg('duration')
WHERE "id" = sqlc.arg('id')
RETURNING "id";

-- name: GetService :one
SELECT "id", "service_name_id", "specialist_id", "price", "duration"
FROM services
WHERE "service_name_id" = sqlc.arg('serviceNameId') AND "specialist_id" = sqlc.arg('specialistId');

-- name: GetServiceByID :one
SELECT "id", "service_name_id", "specialist_id", "price", "duration"
FROM services
WHERE "id" = sqlc.arg('serviceId');

-- name: DeleteService :execrows
DELETE FROM "services"
WHERE "id" = sqlc.arg('serviceId');
