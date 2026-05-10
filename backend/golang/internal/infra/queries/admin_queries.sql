-- name: CreateAdmin :one
INSERT INTO "admins" ("id", "name", "email", "password")
VALUES ( sqlc.arg('id')
       , sqlc.arg('name')
       , sqlc.arg('email')
       , sqlc.arg('password')
       )
RETURNING "id";
