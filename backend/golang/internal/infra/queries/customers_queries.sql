-- name: CreateCustomer :one
INSERT INTO "customers" ("id", "name", "email", "phone", "birthdate", "cpf")
VALUES ( sqlc.arg('id')
       , sqlc.arg('name')
       , sqlc.arg('email')
       , sqlc.arg('phone')
       , sqlc.arg('birthdate')
       , sqlc.arg('cpf')
       )
RETURNING "id", "name", "email", "phone", "birthdate", "cpf";

-- name: UpdateCustomer :one
UPDATE "customers"
SET
  "name"      = sqlc.arg('name'),
  "email"     = sqlc.arg('email'),
  "phone"     = sqlc.arg('phone'),
  "birthdate" = sqlc.arg('birthdate'),
  "cpf"       = sqlc.arg('cpf')
WHERE "id" = sqlc.arg('id')
RETURNING "id", "name", "email", "phone", "birthdate", "cpf";

-- name: GetCustomerByID :one
SELECT "id", "name", "email", "phone", "birthdate", "cpf"
FROM "customers"
WHERE "id" = sqlc.arg('customerId')
LIMIT 1;

-- name: GetCustomerByPhone :one
SELECT "id", "name", "email", "phone", "birthdate", "cpf"
FROM "customers"
WHERE "phone" = sqlc.arg('customerPhone')
LIMIT 1;

-- name: ListCustomers :many
SELECT "id", "name", "email", "phone", "birthdate", "cpf"
FROM "customers"
WHERE true
  AND (sqlc.arg('name')::text = ''  OR "name" ILIKE '%' || sqlc.arg('name') || '%')
  AND (sqlc.arg('cpf')::text = ''   OR "cpf" = sqlc.arg('cpf'))
  AND (sqlc.arg('phone')::text = '' OR "phone" = sqlc.arg('phone'))
ORDER BY "name"
LIMIT sqlc.arg('limit')::integer
OFFSET sqlc.arg('offset')::integer;

-- name: CountCustomers :one
SELECT COUNT(id)::int as count
FROM "customers"
WHERE true
  AND (sqlc.arg('name')::text = ''  OR "name" ILIKE '%' || sqlc.arg('name') || '%')
  AND (sqlc.arg('cpf')::text = ''   OR "cpf" = sqlc.arg('cpf'))
  AND (sqlc.arg('phone')::text = '' OR "phone" = sqlc.arg('phone'));

-- name: DeleteCustomerByID :execrows
DELETE FROM "customers"
WHERE "id" = sqlc.arg('customerId');
