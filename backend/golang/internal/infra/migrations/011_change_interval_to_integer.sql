-- changing all INTEVAL columns to an INTEGER representing total minutes

ALTER TABLE appointments
ALTER COLUMN duration TYPE integer
USING (EXTRACT(EPOCH FROM duration) / 60)::integer;

ALTER TABLE services
ALTER COLUMN duration TYPE integer
USING (EXTRACT(EPOCH FROM duration) / 60)::integer;

---- create above / drop below ----

ALTER TABLE appointments
ALTER COLUMN duration TYPE interval
USING (duration * INTERVAL '1 minute');

ALTER TABLE services
ALTER COLUMN duration TYPE interval
USING (duration * INTERVAL '1 minute');
