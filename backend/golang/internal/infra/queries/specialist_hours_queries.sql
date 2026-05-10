-- name: CreateSpecialistHour :one
INSERT INTO specialist_hours ("id", "specialist_id", "weekday", "start_time", "end_time")
VALUES ( sqlc.arg('id')
       , sqlc.arg('specialistId')
       , sqlc.arg('weekday')
       , sqlc.arg('startTime')
       , sqlc.arg('endTime')
       )
RETURNING "id";

-- name: ListSpecialistHoursIntersecting :many
SELECT "id", "specialist_id", "weekday", "start_time", "end_time"
FROM specialist_hours
WHERE "specialist_id" = sqlc.arg('specialistId')
  AND "weekday" = sqlc.arg('weekday')
  AND (
    sqlc.arg('startTime')::time BETWEEN "start_time" AND "end_time"
    OR 
    sqlc.arg('endTime')::time BETWEEN "start_time" AND "end_time"
  )
ORDER BY "start_time" ASC;

-- name: UpdateSpecialistHourStartAndEndTime :exec
UPDATE specialist_hours
SET "start_time" = sqlc.arg('startTime')::time
  , "end_time"   = sqlc.arg('endTime')::time
WHERE "id" = sqlc.arg('specialistHoursId');
