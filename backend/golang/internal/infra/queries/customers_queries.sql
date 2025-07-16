-- name: CreateCustomer :one
INSERT INTO "customers" ("name", "email", "phone", "birthdate", "cpf")
VALUES ($1, $2, $3, $4, $5)
RETURNING "id", "name", "email", "phone", "birthdate", "cpf";

-- name: UpdateCustomer :one
UPDATE "customers"
SET
  "name" = sqlc.arg('name'),
  "email" = sqlc.arg('email'),
  "phone" = sqlc.arg('phone'),
  "birthdate" = sqlc.arg('birthdate'),
  "cpf" = sqlc.arg('cpf')
WHERE "id" = sqlc.arg('id')
RETURNING "id", "name", "email", "phone", "birthdate", "cpf";

-- name: GetCustomerByID :one
SELECT "id", "name", "email", "phone", "birthdate", "cpf"
FROM "customers"
WHERE "id" = $1
LIMIT 1;

-- name: GetCustomerByPhone :one
SELECT "id", "name", "email", "phone", "birthdate", "cpf"
FROM "customers"
WHERE "phone" = $1
LIMIT 1;

-- name: ListCustomers :many
SELECT "id", "name", "email", "phone", "birthdate", "cpf"
FROM "customers"
WHERE true
  AND ($1::text = '' OR "name" ILIKE '%' || $1 || '%')
  AND ($2::text = '' OR "cpf" = $2)
  AND ($3::text = '' OR "phone" = $3)
LIMIT $4
OFFSET $5;

-- name: CountCustomers :one
SELECT COUNT(id)
FROM "customers"
WHERE true
  AND ($1::text = '' OR "name" ILIKE '%' || $1 || '%')
  AND ($2::text = '' OR "cpf" = $2)
  AND ($3::text = '' OR "phone" = $3);

-- name: DeleteCustomerByID :exec
DELETE FROM "customers"
WHERE "id" = $1;
