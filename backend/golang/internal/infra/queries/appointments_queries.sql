-- name: CreateAppointment :one
INSERT INTO "appointments" ("id", "customer_id", "specialist_id", "service_name_id", "price", "duration", "date", "time", "status")
VALUES ( sqlc.arg('id')
       , sqlc.arg('customerId')
       , sqlc.arg('specialistId')
       , sqlc.arg('serviceNameId')
       , sqlc.arg('price')
       , sqlc.arg('duration')
       , sqlc.arg('date')
       , sqlc.arg('time')
       , sqlc.arg('status')
       )
RETURNING "id";

-- name: UpdateAppointment :one
UPDATE "appointments"
SET
  "date" = sqlc.arg('date'),
  "time" = sqlc.arg('time'),
  "status" = sqlc.arg('status')
WHERE "id" = sqlc.arg('id')
RETURNING "id", "customer_id", "specialist_id", "service_name_id", "price", "duration", "date", "time", "status", "notified_at", "notified_by";

-- name: ListAppointmentsBySpecialistID :many
SELECT "a"."id", "a"."price", "a"."duration", "a"."date", "a"."time", "a"."status", "a"."notified_at", "a"."notified_by",
  "a"."customer_id", "c"."name" AS "customer_name",
  "a"."service_name_id", "sn"."name" AS "service_name"
FROM "appointments" "a"
JOIN "customers" "c" ON "a"."customer_id" = "c"."id"
JOIN "service_names" "sn" ON "a"."service_name_id" = "sn"."id"
WHERE "a"."specialist_id" = sqlc.arg('specialistId')
  AND (sqlc.arg('date')::text = '' OR "a"."date" = DATE(sqlc.arg('date')::text))
ORDER BY "a"."date" DESC, "a"."time" DESC;

-- name: GetAppointmentByID :one
SELECT "id", "customer_id", "specialist_id", "service_name_id", "price", "duration", "date", "time", "status", "notified_at", "notified_by"
FROM "appointments"
WHERE "id" = sqlc.arg('id');

-- name: GetAppointmentEnrichedByID :one
SELECT "a"."id", "a"."price", "a"."duration", "a"."date", "a"."time", "a"."status", "a"."notified_at", "a"."notified_by",
  "a"."customer_id", "c"."name" AS "customer_name",
  "a"."specialist_id", "s"."name" AS "specialist_name",
  "a"."service_name_id", "sn"."name" AS "service_name"
FROM "appointments" "a"
JOIN "customers" "c" ON "a"."customer_id" = "c"."id"
JOIN "specialists" "s" ON "a"."specialist_id" = "s"."id"
JOIN "service_names" "sn" ON "a"."service_name_id" = "sn"."id"
WHERE "a"."id" = sqlc.arg('id');

-- name: ListAppointmentsByDate :many
SELECT "id", "customer_id", "specialist_id", "service_name_id", "price", "duration", "date", "time", "status", "notified_at", "notified_by"
FROM "appointments"
WHERE "date" = sqlc.arg('date')
ORDER BY "date" DESC, "time" DESC;

-- name: ListAppointments :many
SELECT "a"."id", "a"."price", "a"."duration", "a"."date", "a"."time", "a"."status", "a"."notified_at", "a"."notified_by",
  "a"."customer_id", "c"."name" AS "customer_name",
  "a"."specialist_id", "s"."name" AS "specialist_name",
  "a"."service_name_id", "sn"."name" AS "service_name"
FROM "appointments" "a"
JOIN "customers" "c" ON "a"."customer_id" = "c"."id"
JOIN "specialists" "s" ON "a"."specialist_id" = "s"."id"
JOIN "service_names" "sn" ON "a"."service_name_id" = "sn"."id"
WHERE true
  AND (sqlc.arg('startDate')::date IS NULL OR "a"."date" >= sqlc.arg('startDate')) 
  AND (sqlc.arg('endDate')::date IS NULL   OR "a"."date" <= sqlc.arg('endDate'))
  AND (sqlc.arg('customerName') = ''       OR "c"."name" ILIKE '%' || sqlc.arg('customerName') || '%')
  AND (sqlc.arg('specialistName') = ''     OR "s"."name" ILIKE '%' || sqlc.arg('specialistName') || '%')
  AND (sqlc.arg('serviceName') = ''        OR "sn"."name" ILIKE '%' || sqlc.arg('serviceName') || '%')
  AND (sqlc.arg('status') = 0              OR "a"."status" = sqlc.arg('status'))
ORDER BY "a"."date" DESC, "a"."time" DESC
LIMIT sqlc.arg('limit')::integer
OFFSET sqlc.arg('offset')::integer;

-- name: CountAppointments :one
SELECT COUNT("a"."id")::int AS count
FROM "appointments" "a"
JOIN "customers" "c" ON "a"."customer_id" = "c"."id"
JOIN "specialists" "s" ON "a"."specialist_id" = "s"."id"
JOIN "service_names" "sn" ON "a"."service_name_id" = "sn"."id"
WHERE true
  AND (sqlc.arg('startDate')::date IS NULL   OR "a"."date" >= sqlc.arg('startDate')) 
  AND (sqlc.arg('endDate')::date IS NULL     OR "a"."date" <= sqlc.arg('endDate'))
  AND (sqlc.arg('customerName')::text = ''   OR "c"."name" ILIKE '%' || sqlc.arg('customerName') || '%')
  AND (sqlc.arg('specialistName')::text = '' OR "s"."name" ILIKE '%' || sqlc.arg('specialistName') || '%')
  AND (sqlc.arg('serviceName')::text = ''    OR "sn"."name" ILIKE '%' || sqlc.arg('serviceName') || '%')
  AND (sqlc.arg('status')::integer = 0       OR "a"."status" = sqlc.arg('status'));

-- name: ListAppointmentsCalendar :many
SELECT "a"."id", "a"."date", "a"."time", "a"."status", "s"."name" AS "specialist_name"
FROM "appointments" "a"
JOIN "specialists" "s" ON "a"."specialist_id" = "s"."id"
WHERE "a"."date" >= sqlc.arg('startDate')
  AND "a"."date" <= sqlc.arg('endDate')
ORDER BY "a"."date" DESC, "a"."time" DESC;

-- name: ListAppointmentsCalendarCount :many
SELECT date_part('month', "a"."date")::int AS "month"
     , "status", COUNT("a"."id")::int AS "count"
FROM "appointments" "a"
WHERE "a"."date" >= sqlc.arg('startDate')
  AND "a"."date" <= sqlc.arg('endDate')
GROUP BY "month", "status"
ORDER BY "month" ASC;

-- name: AppointmentsIntersects :one
SELECT COUNT("date") > 0 AS count
FROM "appointments"
WHERE "date" = sqlc.arg('date')
  AND "specialist_id" = sqlc.arg('specialistId')
  AND (
    "time" < sqlc.arg('time')::time + make_interval(mins => sqlc.arg('duration')::integer)
    AND sqlc.arg('time')::time < "time" + make_interval(mins => "duration")
  )
LIMIT 1;

-- name: DeleteAppointment :execrows
DELETE FROM "appointments"
WHERE "id" = sqlc.arg('appointmentId');
