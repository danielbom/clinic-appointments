-- name: GetServiceAvailableByID :one
SELECT "sn"."id" as "service_name_id", "sn"."name" as "service_name"
     , "sp"."id" as "specialization_id", "sp"."name" as "specialization"
FROM "service_names" "sn"
JOIN "specializations" "sp" ON "sn"."specialization_id" = "sp"."id"
WHERE "sn"."id" = sqlc.arg('serviceNameId');
