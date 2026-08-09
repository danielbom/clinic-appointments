ALTER TABLE "admins" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "secretaries" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "customers" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "specialists" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "specializations" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "service_names" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "services" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "specialist_hours" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "appointments" ALTER COLUMN "id" DROP DEFAULT;

---- create above / drop below ----

ALTER TABLE "admins" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "secretaries" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "customers" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "specialists" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "specializations" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "service_names" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "services" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "specialist_hours" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "appointments" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
