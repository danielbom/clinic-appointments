-- name: ListServicesEnriched :many
SELECT "s"."id", "s"."price", "s"."duration",
       "s"."specialist_id", "sp"."name" as "specialist_name",
       "s"."service_name_id", "sn"."name" as "service_name",
       "sn"."specialization_id", "sz"."name" as "specialization_name"
FROM "services" "s"
JOIN "specialists" "sp" ON "s"."specialist_id" = "sp"."id"
JOIN "service_names" "sn" ON "s"."service_name_id" = "sn"."id"
JOIN "specializations" "sz" ON "sn"."specialization_id" = "sz"."id"
WHERE true
   AND ($3::text = '' OR LOWER(unaccent("sp"."name")) LIKE '%' || LOWER(unaccent($3)) || '%')
   AND ($4::text = '' OR LOWER(unaccent("sz"."name")) LIKE '%' || LOWER(unaccent($4)) || '%')
   AND ($5::text = '' OR LOWER(unaccent("sn"."name")) LIKE '%' || LOWER(unaccent($5)) || '%')
LIMIT $1
OFFSET $2;

-- name: CountServicesEnriched :one
SELECT COUNT("s"."id")
FROM "services" "s"
JOIN "specialists" "sp" ON "s"."specialist_id" = "sp"."id"
JOIN "service_names" "sn" ON "s"."service_name_id" = "sn"."id"
JOIN "specializations" "sz" ON "sn"."specialization_id" = "sz"."id"
WHERE true
   AND ($1::text = '' OR LOWER(unaccent("sp"."name")) LIKE '%' || LOWER(unaccent($1)) || '%')
   AND ($2::text = '' OR LOWER(unaccent("sz"."name")) LIKE '%' || LOWER(unaccent($2)) || '%')
   AND ($3::text = '' OR LOWER(unaccent("sn"."name")) LIKE '%' || LOWER(unaccent($3)) || '%');
