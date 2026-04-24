-- name: CreateSpecialist :one
INSERT INTO specialists ("id", "name", "email", "phone", "birthdate", "cpf", "cnpj")
VALUES ( sqlc.arg('id')
       , sqlc.arg('name')
       , sqlc.arg('email')
       , sqlc.arg('phone')
       , sqlc.arg('birthdate')
       , sqlc.arg('cpf')
       , sqlc.arg('cnpj')
       )
RETURNING "id";

-- name: CountSpecialists :one
SELECT COUNT("s"."id")::int as count
FROM "specialists" "s"
WHERE true
  AND (sqlc.arg('name')::text = ''  OR "name" ILIKE '%' || LOWER(unaccent(sqlc.arg('name'))) || '%')
  AND (sqlc.arg('cpf')::text = ''   OR "cpf" = sqlc.arg('cpf'))
  AND (sqlc.arg('cnpj')::text = ''  OR "cnpj" = sqlc.arg('cnpj'))
  AND (sqlc.arg('phone')::text = '' OR "phone" = sqlc.arg('phone'));

-- name: UpdateSpecialist :one
UPDATE "specialists"
SET 
  "name"      = sqlc.arg('name'),
  "email"     = sqlc.arg('email'),
  "phone"     = sqlc.arg('phone'),
  "birthdate" = sqlc.arg('birthdate'),
  "cpf"       = sqlc.arg('cpf'),
  "cnpj"      = sqlc.arg('cnpj')
WHERE "id" = sqlc.arg('id')
RETURNING "id", "name", "email", "phone", "birthdate", "cpf", "cnpj";

-- name: GetSpecialistByID :one
SELECT "id", "name", "email", "phone", "birthdate", "cpf", "cnpj"
FROM "specialists"
WHERE "id" = sqlc.arg('specialistId')
LIMIT 1;

-- name: GetSpecialistByEmail :one
SELECT "id", "name", "email", "phone", "birthdate", "cpf", "cnpj"
FROM "specialists"
WHERE "email" = sqlc.arg('specialistEmail')
LIMIT 1;

-- name: ListSpecialists :many
SELECT "id", "name", "email", "phone", "birthdate", "cpf", "cnpj"
FROM "specialists"
WHERE true
  AND (sqlc.arg('name')::text = ''  OR "name" ILIKE '%' || sqlc.arg('name') || '%')
  AND (sqlc.arg('cpf')::text = ''   OR "cpf" = sqlc.arg('cpf'))
  AND (sqlc.arg('cnpj')::text = ''  OR "cnpj" = sqlc.arg('cnpj'))
  AND (sqlc.arg('phone')::text = '' OR "phone" = sqlc.arg('phone'))
LIMIT sqlc.arg('limit')::integer
OFFSET sqlc.arg('offset')::integer;

-- name: DeleteSpecialistByID :execrows
DELETE FROM "specialists"
WHERE "id" = sqlc.arg('specialistId');

-- name: ListServicesBySpecialistID :many
SELECT "s"."id",
    "sn"."specialization_id",
    "sn"."id" as "service_name_id",
    "sn"."name" as "service_name",
    "s"."price", "s"."duration"
FROM "services" "s"
JOIN "service_names" "sn" ON "sn"."id" = "s"."service_name_id"
WHERE "s"."specialist_id" = sqlc.arg('specialistId');
