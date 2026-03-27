-- name: GetIdentityByEmail :one
SELECT "id", "name", "email", "password", 'admin' as "role"
FROM "admins"
WHERE "admins"."email" = sqlc.arg('email')
UNION
SELECT "id", "name", "email", "password", 'secretary' as "role"
FROM "secretaries"
WHERE "secretaries"."email" = sqlc.arg('email')
LIMIT 1;

-- name: GetIdentityByID :one
SELECT "id", "name", "email", "password", 'admin' as "role"
FROM "admins"
WHERE "admins"."id" = sqlc.arg('id')
UNION
SELECT "id", "name", "email", "password", 'secretary' as "role"
FROM "secretaries"
WHERE "secretaries"."id" = sqlc.arg('id')
LIMIT 1;
