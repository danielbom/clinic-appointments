-- name: CreateSecretary :one
INSERT INTO "secretaries" ("name", "email", "password", "phone", "birthdate", "cpf", "cnpj")
VALUES ( sqlc.arg('name')
       , sqlc.arg('email')
       , sqlc.arg('password')
       , sqlc.arg('phone')
       , sqlc.arg('birthdate')
       , sqlc.arg('cpf')
       , sqlc.arg('cnpj')
       )
RETURNING "id", "name", "email", "password", "phone", "birthdate", "cpf", "cnpj";

-- name: UpdateSecretary :one
UPDATE "secretaries"
SET
  "name"      = sqlc.arg('name'),
  "email"     = sqlc.arg('email'),
  "password"  = sqlc.arg('password'),
  "phone"     = sqlc.arg('phone'),
  "birthdate" = sqlc.arg('birthdate'),
  "cpf"       = sqlc.arg('cpf'),
  "cnpj"      = sqlc.arg('cnpj')
WHERE "id" = sqlc.arg('id')
RETURNING "id", "name", "email", "password", "phone", "birthdate", "cpf", "cnpj";

-- name: GetSecretaryByID :one
SELECT "id", "name", "email", "password", "phone", "birthdate", "cpf", "cnpj"
FROM "secretaries"
WHERE "id" = sqlc.arg('secretaryId')
LIMIT 1;

-- name: GetSecretaryByEmail :one
SELECT "id", "name", "email", "password", "phone", "birthdate", "cpf", "cnpj"
FROM "secretaries"
WHERE "email" = sqlc.arg('secretaryId')
LIMIT 1;

-- name: ListSecretaries :many
SELECT "id", "name", "email", "password", "phone", "birthdate", "cpf", "cnpj"
FROM "secretaries"
WHERE true
  AND (sqlc.arg('name')::text = ''  OR "name" ILIKE '%' || sqlc.arg('name') || '%')
  AND (sqlc.arg('cpf')::text = ''   OR "cpf" = sqlc.arg('cpf'))
  AND (sqlc.arg('phone')::text = '' OR "phone" = sqlc.arg('phone'))
LIMIT sqlc.arg('limit')::integer
OFFSET sqlc.arg('offset')::integer;

-- name: CountSecretaries :one
SELECT COUNT(id)::int as count
FROM "secretaries"
WHERE true
  AND (sqlc.arg('name')::text = ''  OR "name" ILIKE '%' || sqlc.arg('name') || '%')
  AND (sqlc.arg('cpf')::text = ''   OR "cpf" = sqlc.arg('cpf'))
  AND (sqlc.arg('phone')::text = '' OR "phone" = sqlc.arg('phone'));

-- name: DeleteSecretaryByID :execrows
DELETE FROM "secretaries"
WHERE "id" = sqlc.arg('secretaryId');
