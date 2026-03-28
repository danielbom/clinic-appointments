-- That migration lose the exact original representation

ALTER TABLE appointments
ALTER COLUMN duration TYPE integer
USING EXTRACT(EPOCH FROM duration);

ALTER TABLE services
ALTER COLUMN duration TYPE integer
USING EXTRACT(EPOCH FROM duration);

---- create above / drop below ----

ALTER TABLE appointments 
ALTER COLUMN duration TYPE interval
USING (duration * interval '1 second');

ALTER TABLE services
ALTER COLUMN duration TYPE interval
USING (duration * interval '1 second');
