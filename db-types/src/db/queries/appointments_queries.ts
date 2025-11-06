/** Types generated for queries found in "generated/queries/appointments_queries.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type DateOrString = Date | string;

/** 'CreateAppointment' parameters type */
export interface ICreateAppointmentParams {
  customerId?: string | null | void;
  date?: string | null | void;
  duration?: number | null | void;
  price?: number | null | void;
  serviceNameId?: string | null | void;
  specialistId?: string | null | void;
  status?: number | null | void;
  time?: DateOrString | null | void;
}

/** 'CreateAppointment' return type */
export interface ICreateAppointmentResult {
  id: string;
}

/** 'CreateAppointment' query type */
export interface ICreateAppointmentQuery {
  params: ICreateAppointmentParams;
  result: ICreateAppointmentResult;
}

const createAppointmentIR: any = {"usedParamSet":{"customerId":true,"specialistId":true,"serviceNameId":true,"price":true,"duration":true,"date":true,"time":true,"status":true},"params":[{"name":"customerId","required":false,"transform":{"type":"scalar"},"locs":[{"a":135,"b":145}]},{"name":"specialistId","required":false,"transform":{"type":"scalar"},"locs":[{"a":156,"b":168}]},{"name":"serviceNameId","required":false,"transform":{"type":"scalar"},"locs":[{"a":179,"b":192}]},{"name":"price","required":false,"transform":{"type":"scalar"},"locs":[{"a":203,"b":208}]},{"name":"duration","required":false,"transform":{"type":"scalar"},"locs":[{"a":219,"b":227}]},{"name":"date","required":false,"transform":{"type":"scalar"},"locs":[{"a":238,"b":242}]},{"name":"time","required":false,"transform":{"type":"scalar"},"locs":[{"a":253,"b":257}]},{"name":"status","required":false,"transform":{"type":"scalar"},"locs":[{"a":268,"b":274}]}],"statement":"INSERT INTO \"appointments\" (\"customer_id\", \"specialist_id\", \"service_name_id\", \"price\", \"duration\", \"date\", \"time\", \"status\")\nVALUES ( :customerId\n       , :specialistId\n       , :serviceNameId\n       , :price\n       , :duration\n       , :date\n       , :time\n       , :status\n       )\nRETURNING \"id\""};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO "appointments" ("customer_id", "specialist_id", "service_name_id", "price", "duration", "date", "time", "status")
 * VALUES ( :customerId
 *        , :specialistId
 *        , :serviceNameId
 *        , :price
 *        , :duration
 *        , :date
 *        , :time
 *        , :status
 *        )
 * RETURNING "id"
 * ```
 */
export const createAppointment = new PreparedQuery<ICreateAppointmentParams,ICreateAppointmentResult>(createAppointmentIR);


/** 'UpdateAppointment' parameters type */
export interface IUpdateAppointmentParams {
  date?: string | null | void;
  id?: string | null | void;
  status?: number | null | void;
  time?: DateOrString | null | void;
}

/** 'UpdateAppointment' return type */
export interface IUpdateAppointmentResult {
  customer_id: string;
  date: string;
  duration: number;
  id: string;
  notified_at: Date | null;
  notified_by: string | null;
  price: number;
  service_name_id: string;
  specialist_id: string;
  status: number;
  time: Date;
}

/** 'UpdateAppointment' query type */
export interface IUpdateAppointmentQuery {
  params: IUpdateAppointmentParams;
  result: IUpdateAppointmentResult;
}

const updateAppointmentIR: any = {"usedParamSet":{"date":true,"time":true,"status":true,"id":true},"params":[{"name":"date","required":false,"transform":{"type":"scalar"},"locs":[{"a":37,"b":41}]},{"name":"time","required":false,"transform":{"type":"scalar"},"locs":[{"a":55,"b":59}]},{"name":"status","required":false,"transform":{"type":"scalar"},"locs":[{"a":75,"b":81}]},{"name":"id","required":false,"transform":{"type":"scalar"},"locs":[{"a":96,"b":98}]}],"statement":"UPDATE \"appointments\"\nSET\n  \"date\" = :date,\n  \"time\" = :time,\n  \"status\" = :status\nWHERE \"id\" = :id\nRETURNING \"id\", \"customer_id\", \"specialist_id\", \"service_name_id\", \"price\", \"duration\", \"date\", \"time\", \"status\", \"notified_at\", \"notified_by\""};

/**
 * Query generated from SQL:
 * ```
 * UPDATE "appointments"
 * SET
 *   "date" = :date,
 *   "time" = :time,
 *   "status" = :status
 * WHERE "id" = :id
 * RETURNING "id", "customer_id", "specialist_id", "service_name_id", "price", "duration", "date", "time", "status", "notified_at", "notified_by"
 * ```
 */
export const updateAppointment = new PreparedQuery<IUpdateAppointmentParams,IUpdateAppointmentResult>(updateAppointmentIR);


/** 'ListAppointmentsBySpecialistId' parameters type */
export interface IListAppointmentsBySpecialistIdParams {
  date?: string | null | void;
  specialistId?: string | null | void;
}

/** 'ListAppointmentsBySpecialistId' return type */
export interface IListAppointmentsBySpecialistIdResult {
  customer_id: string;
  customer_name: string;
  date: string;
  duration: number;
  id: string;
  notified_at: Date | null;
  notified_by: string | null;
  price: number;
  service_name: string;
  service_name_id: string;
  status: number;
  time: Date;
}

/** 'ListAppointmentsBySpecialistId' query type */
export interface IListAppointmentsBySpecialistIdQuery {
  params: IListAppointmentsBySpecialistIdParams;
  result: IListAppointmentsBySpecialistIdResult;
}

const listAppointmentsBySpecialistIdIR: any = {"usedParamSet":{"specialistId":true,"date":true},"params":[{"name":"specialistId","required":false,"transform":{"type":"scalar"},"locs":[{"a":397,"b":409}]},{"name":"date","required":false,"transform":{"type":"scalar"},"locs":[{"a":418,"b":422},{"a":456,"b":460}]}],"statement":"SELECT \"a\".\"id\", \"a\".\"price\", \"a\".\"duration\", \"a\".\"date\", \"a\".\"time\", \"a\".\"status\", \"a\".\"notified_at\", \"a\".\"notified_by\",\n  \"a\".\"customer_id\", \"c\".\"name\" as \"customer_name\",\n  \"a\".\"service_name_id\", \"sn\".\"name\" as \"service_name\"\nFROM \"appointments\" \"a\"\nJOIN \"customers\" \"c\" ON \"a\".\"customer_id\" = \"c\".\"id\"\nJOIN \"service_names\" \"sn\" ON \"a\".\"service_name_id\" = \"sn\".\"id\"\nWHERE \"a\".\"specialist_id\" = :specialistId\n  AND (:date::text = '' OR \"a\".\"date\" = DATE(:date::text))\nORDER BY \"a\".\"date\" DESC, \"a\".\"time\" DESC"};

/**
 * Query generated from SQL:
 * ```
 * SELECT "a"."id", "a"."price", "a"."duration", "a"."date", "a"."time", "a"."status", "a"."notified_at", "a"."notified_by",
 *   "a"."customer_id", "c"."name" as "customer_name",
 *   "a"."service_name_id", "sn"."name" as "service_name"
 * FROM "appointments" "a"
 * JOIN "customers" "c" ON "a"."customer_id" = "c"."id"
 * JOIN "service_names" "sn" ON "a"."service_name_id" = "sn"."id"
 * WHERE "a"."specialist_id" = :specialistId
 *   AND (:date::text = '' OR "a"."date" = DATE(:date::text))
 * ORDER BY "a"."date" DESC, "a"."time" DESC
 * ```
 */
export const listAppointmentsBySpecialistId = new PreparedQuery<IListAppointmentsBySpecialistIdParams,IListAppointmentsBySpecialistIdResult>(listAppointmentsBySpecialistIdIR);


/** 'GetAppointmentById' parameters type */
export interface IGetAppointmentByIdParams {
  id?: string | null | void;
}

/** 'GetAppointmentById' return type */
export interface IGetAppointmentByIdResult {
  customer_id: string;
  date: string;
  duration: number;
  id: string;
  notified_at: Date | null;
  notified_by: string | null;
  price: number;
  service_name_id: string;
  specialist_id: string;
  status: number;
  time: Date;
}

/** 'GetAppointmentById' query type */
export interface IGetAppointmentByIdQuery {
  params: IGetAppointmentByIdParams;
  result: IGetAppointmentByIdResult;
}

const getAppointmentByIdIR: any = {"usedParamSet":{"id":true},"params":[{"name":"id","required":false,"transform":{"type":"scalar"},"locs":[{"a":173,"b":175}]}],"statement":"SELECT \"id\", \"customer_id\", \"specialist_id\", \"service_name_id\", \"price\", \"duration\", \"date\", \"time\", \"status\", \"notified_at\", \"notified_by\"\nFROM \"appointments\"\nWHERE \"id\" = :id"};

/**
 * Query generated from SQL:
 * ```
 * SELECT "id", "customer_id", "specialist_id", "service_name_id", "price", "duration", "date", "time", "status", "notified_at", "notified_by"
 * FROM "appointments"
 * WHERE "id" = :id
 * ```
 */
export const getAppointmentById = new PreparedQuery<IGetAppointmentByIdParams,IGetAppointmentByIdResult>(getAppointmentByIdIR);


/** 'GetAppointmentEnrichedById' parameters type */
export interface IGetAppointmentEnrichedByIdParams {
  id?: string | null | void;
}

/** 'GetAppointmentEnrichedById' return type */
export interface IGetAppointmentEnrichedByIdResult {
  customer_id: string;
  customer_name: string;
  date: string;
  duration: number;
  id: string;
  notified_at: Date | null;
  notified_by: string | null;
  price: number;
  service_name: string;
  service_name_id: string;
  specialist_id: string;
  specialist_name: string;
  status: number;
  time: Date;
}

/** 'GetAppointmentEnrichedById' query type */
export interface IGetAppointmentEnrichedByIdQuery {
  params: IGetAppointmentEnrichedByIdParams;
  result: IGetAppointmentEnrichedByIdResult;
}

const getAppointmentEnrichedByIdIR: any = {"usedParamSet":{"id":true},"params":[{"name":"id","required":false,"transform":{"type":"scalar"},"locs":[{"a":499,"b":501}]}],"statement":"SELECT \"a\".\"id\", \"a\".\"price\", \"a\".\"duration\", \"a\".\"date\", \"a\".\"time\", \"a\".\"status\", \"a\".\"notified_at\", \"a\".\"notified_by\",\n  \"a\".\"customer_id\", \"c\".\"name\" as \"customer_name\",\n  \"a\".\"specialist_id\", \"s\".\"name\" as \"specialist_name\",\n  \"a\".\"service_name_id\", \"sn\".\"name\" as \"service_name\"\nFROM \"appointments\" \"a\"\nJOIN \"customers\" \"c\" ON \"a\".\"customer_id\" = \"c\".\"id\"\nJOIN \"specialists\" \"s\" ON \"a\".\"specialist_id\" = \"s\".\"id\"\nJOIN \"service_names\" \"sn\" ON \"a\".\"service_name_id\" = \"sn\".\"id\"\nWHERE \"a\".\"id\" = :id"};

/**
 * Query generated from SQL:
 * ```
 * SELECT "a"."id", "a"."price", "a"."duration", "a"."date", "a"."time", "a"."status", "a"."notified_at", "a"."notified_by",
 *   "a"."customer_id", "c"."name" as "customer_name",
 *   "a"."specialist_id", "s"."name" as "specialist_name",
 *   "a"."service_name_id", "sn"."name" as "service_name"
 * FROM "appointments" "a"
 * JOIN "customers" "c" ON "a"."customer_id" = "c"."id"
 * JOIN "specialists" "s" ON "a"."specialist_id" = "s"."id"
 * JOIN "service_names" "sn" ON "a"."service_name_id" = "sn"."id"
 * WHERE "a"."id" = :id
 * ```
 */
export const getAppointmentEnrichedById = new PreparedQuery<IGetAppointmentEnrichedByIdParams,IGetAppointmentEnrichedByIdResult>(getAppointmentEnrichedByIdIR);


/** 'ListAppointmentsByDate' parameters type */
export interface IListAppointmentsByDateParams {
  date?: string | null | void;
}

/** 'ListAppointmentsByDate' return type */
export interface IListAppointmentsByDateResult {
  customer_id: string;
  date: string;
  duration: number;
  id: string;
  notified_at: Date | null;
  notified_by: string | null;
  price: number;
  service_name_id: string;
  specialist_id: string;
  status: number;
  time: Date;
}

/** 'ListAppointmentsByDate' query type */
export interface IListAppointmentsByDateQuery {
  params: IListAppointmentsByDateParams;
  result: IListAppointmentsByDateResult;
}

const listAppointmentsByDateIR: any = {"usedParamSet":{"date":true},"params":[{"name":"date","required":false,"transform":{"type":"scalar"},"locs":[{"a":175,"b":179}]}],"statement":"SELECT \"id\", \"customer_id\", \"specialist_id\", \"service_name_id\", \"price\", \"duration\", \"date\", \"time\", \"status\", \"notified_at\", \"notified_by\"\nFROM \"appointments\"\nWHERE \"date\" = :date\nORDER BY \"date\" DESC, \"time\" DESC"};

/**
 * Query generated from SQL:
 * ```
 * SELECT "id", "customer_id", "specialist_id", "service_name_id", "price", "duration", "date", "time", "status", "notified_at", "notified_by"
 * FROM "appointments"
 * WHERE "date" = :date
 * ORDER BY "date" DESC, "time" DESC
 * ```
 */
export const listAppointmentsByDate = new PreparedQuery<IListAppointmentsByDateParams,IListAppointmentsByDateResult>(listAppointmentsByDateIR);


/** 'ListAppointments' parameters type */
export interface IListAppointmentsParams {
  customerName?: string | null | void;
  endDate?: string | null | void;
  limit?: number | null | void;
  offset?: number | null | void;
  serviceName?: string | null | void;
  specialistName?: string | null | void;
  startDate?: string | null | void;
  status?: number | null | void;
}

/** 'ListAppointments' return type */
export interface IListAppointmentsResult {
  customer_id: string;
  customer_name: string;
  date: string;
  duration: number;
  id: string;
  notified_at: Date | null;
  notified_by: string | null;
  price: number;
  service_name: string;
  service_name_id: string;
  specialist_id: string;
  specialist_name: string;
  status: number;
  time: Date;
}

/** 'ListAppointments' query type */
export interface IListAppointmentsQuery {
  params: IListAppointmentsParams;
  result: IListAppointmentsResult;
}

const listAppointmentsIR: any = {"usedParamSet":{"startDate":true,"endDate":true,"customerName":true,"specialistName":true,"serviceName":true,"status":true,"limit":true,"offset":true},"params":[{"name":"startDate","required":false,"transform":{"type":"scalar"},"locs":[{"a":500,"b":509},{"a":542,"b":551}]},{"name":"endDate","required":false,"transform":{"type":"scalar"},"locs":[{"a":562,"b":569},{"a":604,"b":611}]},{"name":"customerName","required":false,"transform":{"type":"scalar"},"locs":[{"a":621,"b":633},{"a":673,"b":685}]},{"name":"specialistName","required":false,"transform":{"type":"scalar"},"locs":[{"a":702,"b":716},{"a":754,"b":768}]},{"name":"serviceName","required":false,"transform":{"type":"scalar"},"locs":[{"a":785,"b":796},{"a":838,"b":849}]},{"name":"status","required":false,"transform":{"type":"scalar"},"locs":[{"a":866,"b":872},{"a":909,"b":915}]},{"name":"limit","required":false,"transform":{"type":"scalar"},"locs":[{"a":966,"b":971}]},{"name":"offset","required":false,"transform":{"type":"scalar"},"locs":[{"a":989,"b":995}]}],"statement":"SELECT \"a\".\"id\", \"a\".\"price\", \"a\".\"duration\", \"a\".\"date\", \"a\".\"time\", \"a\".\"status\", \"a\".\"notified_at\", \"a\".\"notified_by\",\n  \"a\".\"customer_id\", \"c\".\"name\" as \"customer_name\",\n  \"a\".\"specialist_id\", \"s\".\"name\" as \"specialist_name\",\n  \"a\".\"service_name_id\", \"sn\".\"name\" as \"service_name\"\nFROM \"appointments\" \"a\"\nJOIN \"customers\" \"c\" ON \"a\".\"customer_id\" = \"c\".\"id\"\nJOIN \"specialists\" \"s\" ON \"a\".\"specialist_id\" = \"s\".\"id\"\nJOIN \"service_names\" \"sn\" ON \"a\".\"service_name_id\" = \"sn\".\"id\"\nWHERE true\n  AND (:startDate::date IS NULL OR \"a\".\"date\" >= :startDate) \n  AND (:endDate::date IS NULL   OR \"a\".\"date\" <= :endDate)\n  AND (:customerName = ''       OR \"c\".\"name\" ILIKE '%' || :customerName || '%')\n  AND (:specialistName = ''     OR \"s\".\"name\" ILIKE '%' || :specialistName || '%')\n  AND (:serviceName = ''        OR \"sn\".\"name\" ILIKE '%' || :serviceName || '%')\n  AND (:status = 0              OR \"a\".\"status\" = :status)\nORDER BY \"a\".\"date\" DESC, \"a\".\"time\" DESC\nLIMIT :limit::integer\nOFFSET :offset::integer"};

/**
 * Query generated from SQL:
 * ```
 * SELECT "a"."id", "a"."price", "a"."duration", "a"."date", "a"."time", "a"."status", "a"."notified_at", "a"."notified_by",
 *   "a"."customer_id", "c"."name" as "customer_name",
 *   "a"."specialist_id", "s"."name" as "specialist_name",
 *   "a"."service_name_id", "sn"."name" as "service_name"
 * FROM "appointments" "a"
 * JOIN "customers" "c" ON "a"."customer_id" = "c"."id"
 * JOIN "specialists" "s" ON "a"."specialist_id" = "s"."id"
 * JOIN "service_names" "sn" ON "a"."service_name_id" = "sn"."id"
 * WHERE true
 *   AND (:startDate::date IS NULL OR "a"."date" >= :startDate) 
 *   AND (:endDate::date IS NULL   OR "a"."date" <= :endDate)
 *   AND (:customerName = ''       OR "c"."name" ILIKE '%' || :customerName || '%')
 *   AND (:specialistName = ''     OR "s"."name" ILIKE '%' || :specialistName || '%')
 *   AND (:serviceName = ''        OR "sn"."name" ILIKE '%' || :serviceName || '%')
 *   AND (:status = 0              OR "a"."status" = :status)
 * ORDER BY "a"."date" DESC, "a"."time" DESC
 * LIMIT :limit::integer
 * OFFSET :offset::integer
 * ```
 */
export const listAppointments = new PreparedQuery<IListAppointmentsParams,IListAppointmentsResult>(listAppointmentsIR);


/** 'CountAppointments' parameters type */
export interface ICountAppointmentsParams {
  customerName?: string | null | void;
  endDate?: string | null | void;
  serviceName?: string | null | void;
  specialistName?: string | null | void;
  startDate?: string | null | void;
  status?: number | null | void;
}

/** 'CountAppointments' return type */
export interface ICountAppointmentsResult {
  count: string | null;
}

/** 'CountAppointments' query type */
export interface ICountAppointmentsQuery {
  params: ICountAppointmentsParams;
  result: ICountAppointmentsResult;
}

const countAppointmentsIR: any = {"usedParamSet":{"startDate":true,"endDate":true,"customerName":true,"specialistName":true,"serviceName":true,"status":true},"params":[{"name":"startDate","required":false,"transform":{"type":"scalar"},"locs":[{"a":238,"b":247},{"a":282,"b":291}]},{"name":"endDate","required":false,"transform":{"type":"scalar"},"locs":[{"a":302,"b":309},{"a":346,"b":353}]},{"name":"customerName","required":false,"transform":{"type":"scalar"},"locs":[{"a":363,"b":375},{"a":417,"b":429}]},{"name":"specialistName","required":false,"transform":{"type":"scalar"},"locs":[{"a":446,"b":460},{"a":500,"b":514}]},{"name":"serviceName","required":false,"transform":{"type":"scalar"},"locs":[{"a":531,"b":542},{"a":586,"b":597}]},{"name":"status","required":false,"transform":{"type":"scalar"},"locs":[{"a":614,"b":620},{"a":659,"b":665}]}],"statement":"SELECT COUNT(\"a\".\"id\")\nFROM \"appointments\" \"a\"\nJOIN \"customers\" \"c\" ON \"a\".\"customer_id\" = \"c\".\"id\"\nJOIN \"specialists\" \"s\" ON \"a\".\"specialist_id\" = \"s\".\"id\"\nJOIN \"service_names\" \"sn\" ON \"a\".\"service_name_id\" = \"sn\".\"id\"\nWHERE true\n  AND (:startDate::date IS NULL   OR \"a\".\"date\" >= :startDate) \n  AND (:endDate::date IS NULL     OR \"a\".\"date\" <= :endDate)\n  AND (:customerName::text = ''   OR \"c\".\"name\" ILIKE '%' || :customerName || '%')\n  AND (:specialistName::text = '' OR \"s\".\"name\" ILIKE '%' || :specialistName || '%')\n  AND (:serviceName::text = ''    OR \"sn\".\"name\" ILIKE '%' || :serviceName || '%')\n  AND (:status::integer = 0       OR \"a\".\"status\" = :status)"};

/**
 * Query generated from SQL:
 * ```
 * SELECT COUNT("a"."id")
 * FROM "appointments" "a"
 * JOIN "customers" "c" ON "a"."customer_id" = "c"."id"
 * JOIN "specialists" "s" ON "a"."specialist_id" = "s"."id"
 * JOIN "service_names" "sn" ON "a"."service_name_id" = "sn"."id"
 * WHERE true
 *   AND (:startDate::date IS NULL   OR "a"."date" >= :startDate) 
 *   AND (:endDate::date IS NULL     OR "a"."date" <= :endDate)
 *   AND (:customerName::text = ''   OR "c"."name" ILIKE '%' || :customerName || '%')
 *   AND (:specialistName::text = '' OR "s"."name" ILIKE '%' || :specialistName || '%')
 *   AND (:serviceName::text = ''    OR "sn"."name" ILIKE '%' || :serviceName || '%')
 *   AND (:status::integer = 0       OR "a"."status" = :status)
 * ```
 */
export const countAppointments = new PreparedQuery<ICountAppointmentsParams,ICountAppointmentsResult>(countAppointmentsIR);


/** 'ListAppointmentsCalendar' parameters type */
export interface IListAppointmentsCalendarParams {
  endDate?: string | null | void;
  startDate?: string | null | void;
}

/** 'ListAppointmentsCalendar' return type */
export interface IListAppointmentsCalendarResult {
  date: string;
  id: string;
  specialist_name: string;
  status: number;
  time: Date;
}

/** 'ListAppointmentsCalendar' query type */
export interface IListAppointmentsCalendarQuery {
  params: IListAppointmentsCalendarParams;
  result: IListAppointmentsCalendarResult;
}

const listAppointmentsCalendarIR: any = {"usedParamSet":{"startDate":true,"endDate":true},"params":[{"name":"startDate","required":false,"transform":{"type":"scalar"},"locs":[{"a":188,"b":197}]},{"name":"endDate","required":false,"transform":{"type":"scalar"},"locs":[{"a":219,"b":226}]}],"statement":"SELECT \"a\".\"id\", \"a\".\"date\", \"a\".\"time\", \"a\".\"status\", \"s\".\"name\" as \"specialist_name\"\nFROM \"appointments\" \"a\"\nJOIN \"specialists\" \"s\" ON \"a\".\"specialist_id\" = \"s\".\"id\"\nWHERE \"a\".\"date\" >= :startDate\n  AND \"a\".\"date\" <= :endDate\nORDER BY \"a\".\"date\" DESC, \"a\".\"time\" DESC"};

/**
 * Query generated from SQL:
 * ```
 * SELECT "a"."id", "a"."date", "a"."time", "a"."status", "s"."name" as "specialist_name"
 * FROM "appointments" "a"
 * JOIN "specialists" "s" ON "a"."specialist_id" = "s"."id"
 * WHERE "a"."date" >= :startDate
 *   AND "a"."date" <= :endDate
 * ORDER BY "a"."date" DESC, "a"."time" DESC
 * ```
 */
export const listAppointmentsCalendar = new PreparedQuery<IListAppointmentsCalendarParams,IListAppointmentsCalendarResult>(listAppointmentsCalendarIR);


/** 'ListAppointmentsCalendarCount' parameters type */
export interface IListAppointmentsCalendarCountParams {
  endDate?: string | null | void;
  startDate?: string | null | void;
}

/** 'ListAppointmentsCalendarCount' return type */
export interface IListAppointmentsCalendarCountResult {
  count: number | null;
  month: number | null;
  status: number;
}

/** 'ListAppointmentsCalendarCount' query type */
export interface IListAppointmentsCalendarCountQuery {
  params: IListAppointmentsCalendarCountParams;
  result: IListAppointmentsCalendarCountResult;
}

const listAppointmentsCalendarCountIR: any = {"usedParamSet":{"startDate":true,"endDate":true},"params":[{"name":"startDate","required":false,"transform":{"type":"scalar"},"locs":[{"a":147,"b":156}]},{"name":"endDate","required":false,"transform":{"type":"scalar"},"locs":[{"a":178,"b":185}]}],"statement":"SELECT date_part('month', \"a\".\"date\")::int as \"month\"\n     , \"status\", COUNT(\"a\".\"id\")::int as \"count\"\nFROM \"appointments\" \"a\"\nWHERE \"a\".\"date\" >= :startDate\n  AND \"a\".\"date\" <= :endDate\nGROUP BY \"month\", \"status\"\nORDER BY \"month\" ASC"};

/**
 * Query generated from SQL:
 * ```
 * SELECT date_part('month', "a"."date")::int as "month"
 *      , "status", COUNT("a"."id")::int as "count"
 * FROM "appointments" "a"
 * WHERE "a"."date" >= :startDate
 *   AND "a"."date" <= :endDate
 * GROUP BY "month", "status"
 * ORDER BY "month" ASC
 * ```
 */
export const listAppointmentsCalendarCount = new PreparedQuery<IListAppointmentsCalendarCountParams,IListAppointmentsCalendarCountResult>(listAppointmentsCalendarCountIR);


/** 'AppointmentsIntersects' parameters type */
export interface IAppointmentsIntersectsParams {
  date?: string | null | void;
  duration?: number | null | void;
  specialistId?: string | null | void;
  time?: DateOrString | null | void;
}

/** 'AppointmentsIntersects' return type */
export interface IAppointmentsIntersectsResult {
  count: boolean | null;
}

/** 'AppointmentsIntersects' query type */
export interface IAppointmentsIntersectsQuery {
  params: IAppointmentsIntersectsParams;
  result: IAppointmentsIntersectsResult;
}

const appointmentsIntersectsIR: any = {"usedParamSet":{"date":true,"specialistId":true,"time":true,"duration":true},"params":[{"name":"date","required":false,"transform":{"type":"scalar"},"locs":[{"a":69,"b":73}]},{"name":"specialistId","required":false,"transform":{"type":"scalar"},"locs":[{"a":99,"b":111}]},{"name":"time","required":false,"transform":{"type":"scalar"},"locs":[{"a":136,"b":140},{"a":152,"b":156},{"a":204,"b":208},{"a":242,"b":246}]},{"name":"duration","required":false,"transform":{"type":"scalar"},"locs":[{"a":218,"b":226},{"a":256,"b":264}]}],"statement":"SELECT COUNT(\"date\") > 0 as count\nFROM \"appointments\"\nWHERE \"date\" = :date\n  AND \"specialist_id\" = :specialistId\n  AND (\n    (\"time\" <= :time::time AND :time::time < \"time\" + \"duration\") OR\n    (\"time\" < :time::time + :duration::interval AND :time::time + :duration::interval < \"time\" + \"duration\")\n  )\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT COUNT("date") > 0 as count
 * FROM "appointments"
 * WHERE "date" = :date
 *   AND "specialist_id" = :specialistId
 *   AND (
 *     ("time" <= :time::time AND :time::time < "time" + "duration") OR
 *     ("time" < :time::time + :duration::interval AND :time::time + :duration::interval < "time" + "duration")
 *   )
 * LIMIT 1
 * ```
 */
export const appointmentsIntersects = new PreparedQuery<IAppointmentsIntersectsParams,IAppointmentsIntersectsResult>(appointmentsIntersectsIR);


/** 'DeleteAppointment' parameters type */
export interface IDeleteAppointmentParams {
  appointmentId?: string | null | void;
}

/** 'DeleteAppointment' return type */
export type IDeleteAppointmentResult = void;

/** 'DeleteAppointment' query type */
export interface IDeleteAppointmentQuery {
  params: IDeleteAppointmentParams;
  result: IDeleteAppointmentResult;
}

const deleteAppointmentIR: any = {"usedParamSet":{"appointmentId":true},"params":[{"name":"appointmentId","required":false,"transform":{"type":"scalar"},"locs":[{"a":40,"b":53}]}],"statement":"DELETE FROM \"appointments\"\nWHERE \"id\" = :appointmentId"};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM "appointments"
 * WHERE "id" = :appointmentId
 * ```
 */
export const deleteAppointment = new PreparedQuery<IDeleteAppointmentParams,IDeleteAppointmentResult>(deleteAppointmentIR);


