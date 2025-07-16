-- name: CreateSpecialistHour :one
INSERT INTO specialist_hours ("specialist_id", "weekday", "start_time", "end_time")
VALUES ($1, $2, $3, $4)
RETURNING "id";

-- name: ListSpecialistHoursIntersecting :many
SELECT "id", "specialist_id", "weekday", "start_time", "end_time"
FROM specialist_hours
WHERE "specialist_id" = $1
    AND "weekday" = $2
    AND (
        $3::time BETWEEN "start_time" AND "end_time"
        OR 
        $4::time BETWEEN "start_time" AND "end_time"
    )
ORDER BY "start_time" ASC;

-- name: UpdateSpecialistHourStartAndEndTime :exec
UPDATE specialist_hours
SET "start_time" = $2, "end_time" = $3
WHERE "id" = $1;
