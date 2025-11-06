-- name: CreateAdmin :one
INSERT INTO "admins" ("name", "email", "password")
VALUES ( sqlc.arg('name')
       , sqlc.arg('email')
       , sqlc.arg('password')
       )
RETURNING "id";
