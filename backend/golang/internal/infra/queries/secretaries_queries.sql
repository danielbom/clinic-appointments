-- name: CreateSecretary :one
INSERT INTO "secretaries" ("name", "email", "password", "phone", "birthdate", "cpf", "cnpj")
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING "id", "name", "email", "password", "phone", "birthdate", "cpf", "cnpj";

-- name: UpdateSecretary :one
UPDATE "secretaries"
SET
  "name" = sqlc.arg('name'),
  "email" = sqlc.arg('email'),
  "password" = sqlc.arg('password'),
  "phone" = sqlc.arg('phone'),
  "birthdate" = sqlc.arg('birthdate'),
  "cpf" = sqlc.arg('cpf'),
  "cnpj" = sqlc.arg('cnpj')
WHERE "id" = sqlc.arg('id')
RETURNING "id", "name", "email", "password", "phone", "birthdate", "cpf", "cnpj";

-- name: GetSecretaryByID :one
SELECT "id", "name", "email", "password", "phone", "birthdate", "cpf", "cnpj"
FROM "secretaries"
WHERE "id" = $1
LIMIT 1;

-- name: GetSecretaryByEmail :one
SELECT "id", "name", "email", "password", "phone", "birthdate", "cpf", "cnpj"
FROM "secretaries"
WHERE "email" = $1
LIMIT 1;

-- name: ListSecretaries :many
SELECT "id", "name", "email", "password", "phone", "birthdate", "cpf", "cnpj"
FROM "secretaries"
WHERE true
  AND ($1::text = '' OR "name" ILIKE '%' || $1 || '%')
  AND ($2::text = '' OR "cpf" = $2)
  AND ($3::text = '' OR "phone" = $3)
LIMIT $4
OFFSET $5;

-- name: CountSecretaries :one
SELECT COUNT(id)
FROM "secretaries"
WHERE true
  AND ($1::text = '' OR "name" ILIKE '%' || $1 || '%')
  AND ($2::text = '' OR "cpf" = $2)
  AND ($3::text = '' OR "phone" = $3);

-- name: DeleteSecretaryByID :exec
DELETE FROM "secretaries"
WHERE "id" = $1;
