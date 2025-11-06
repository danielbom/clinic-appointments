/** Types generated for queries found in "generated/queries/services_enriched_queries.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'ListServicesEnriched' parameters type */
export interface IListServicesEnrichedParams {
  limit?: number | null | void;
  offset?: number | null | void;
  serviceName?: string | null | void;
  specialist?: string | null | void;
  specialization?: string | null | void;
}

/** 'ListServicesEnriched' return type */
export interface IListServicesEnrichedResult {
  duration: string;
  id: string;
  price: number;
  service_name: string;
  service_name_id: string;
  specialist_id: string;
  specialist_name: string;
  specialization_id: string;
  specialization_name: string;
}

/** 'ListServicesEnriched' query type */
export interface IListServicesEnrichedQuery {
  params: IListServicesEnrichedParams;
  result: IListServicesEnrichedResult;
}

const listServicesEnrichedIR: any = {"usedParamSet":{"specialist":true,"specialization":true,"serviceName":true,"limit":true,"offset":true},"params":[{"name":"specialist","required":false,"transform":{"type":"scalar"},"locs":[{"a":468,"b":478},{"a":554,"b":564}]},{"name":"specialization","required":false,"transform":{"type":"scalar"},"locs":[{"a":584,"b":598},{"a":670,"b":684}]},{"name":"serviceName","required":false,"transform":{"type":"scalar"},"locs":[{"a":704,"b":715},{"a":790,"b":801}]},{"name":"limit","required":false,"transform":{"type":"scalar"},"locs":[{"a":819,"b":824}]},{"name":"offset","required":false,"transform":{"type":"scalar"},"locs":[{"a":842,"b":848}]}],"statement":"SELECT \"s\".\"id\", \"s\".\"price\", \"s\".\"duration\",\n       \"s\".\"specialist_id\", \"sp\".\"name\" as \"specialist_name\",\n       \"s\".\"service_name_id\", \"sn\".\"name\" as \"service_name\",\n       \"sn\".\"specialization_id\", \"sz\".\"name\" as \"specialization_name\"\nFROM \"services\" \"s\"\nJOIN \"specialists\" \"sp\" ON \"s\".\"specialist_id\" = \"sp\".\"id\"\nJOIN \"service_names\" \"sn\" ON \"s\".\"service_name_id\" = \"sn\".\"id\"\nJOIN \"specializations\" \"sz\" ON \"sn\".\"specialization_id\" = \"sz\".\"id\"\nWHERE true\n   AND (:specialist::text = ''     OR LOWER(unaccent(\"sp\".\"name\")) LIKE '%' || LOWER(unaccent(:specialist)) || '%')\n   AND (:specialization::text = '' OR LOWER(unaccent(\"sz\".\"name\")) LIKE '%' || LOWER(unaccent(:specialization)) || '%')\n   AND (:serviceName::text = ''    OR LOWER(unaccent(\"sn\".\"name\")) LIKE '%' || LOWER(unaccent(:serviceName)) || '%')\nLIMIT :limit::integer\nOFFSET :offset::integer"};

/**
 * Query generated from SQL:
 * ```
 * SELECT "s"."id", "s"."price", "s"."duration",
 *        "s"."specialist_id", "sp"."name" as "specialist_name",
 *        "s"."service_name_id", "sn"."name" as "service_name",
 *        "sn"."specialization_id", "sz"."name" as "specialization_name"
 * FROM "services" "s"
 * JOIN "specialists" "sp" ON "s"."specialist_id" = "sp"."id"
 * JOIN "service_names" "sn" ON "s"."service_name_id" = "sn"."id"
 * JOIN "specializations" "sz" ON "sn"."specialization_id" = "sz"."id"
 * WHERE true
 *    AND (:specialist::text = ''     OR LOWER(unaccent("sp"."name")) LIKE '%' || LOWER(unaccent(:specialist)) || '%')
 *    AND (:specialization::text = '' OR LOWER(unaccent("sz"."name")) LIKE '%' || LOWER(unaccent(:specialization)) || '%')
 *    AND (:serviceName::text = ''    OR LOWER(unaccent("sn"."name")) LIKE '%' || LOWER(unaccent(:serviceName)) || '%')
 * LIMIT :limit::integer
 * OFFSET :offset::integer
 * ```
 */
export const listServicesEnriched = new PreparedQuery<IListServicesEnrichedParams,IListServicesEnrichedResult>(listServicesEnrichedIR);


/** 'CountServicesEnriched' parameters type */
export interface ICountServicesEnrichedParams {
  serviceName?: string | null | void;
  specialist?: string | null | void;
  specialization?: string | null | void;
}

/** 'CountServicesEnriched' return type */
export interface ICountServicesEnrichedResult {
  count: string | null;
}

/** 'CountServicesEnriched' query type */
export interface ICountServicesEnrichedQuery {
  params: ICountServicesEnrichedParams;
  result: ICountServicesEnrichedResult;
}

const countServicesEnrichedIR: any = {"usedParamSet":{"specialist":true,"specialization":true,"serviceName":true},"params":[{"name":"specialist","required":false,"transform":{"type":"scalar"},"locs":[{"a":252,"b":262},{"a":338,"b":348}]},{"name":"specialization","required":false,"transform":{"type":"scalar"},"locs":[{"a":368,"b":382},{"a":454,"b":468}]},{"name":"serviceName","required":false,"transform":{"type":"scalar"},"locs":[{"a":488,"b":499},{"a":574,"b":585}]}],"statement":"SELECT COUNT(\"s\".\"id\")\nFROM \"services\" \"s\"\nJOIN \"specialists\" \"sp\" ON \"s\".\"specialist_id\" = \"sp\".\"id\"\nJOIN \"service_names\" \"sn\" ON \"s\".\"service_name_id\" = \"sn\".\"id\"\nJOIN \"specializations\" \"sz\" ON \"sn\".\"specialization_id\" = \"sz\".\"id\"\nWHERE true\n   AND (:specialist::text = ''     OR LOWER(unaccent(\"sp\".\"name\")) LIKE '%' || LOWER(unaccent(:specialist)) || '%')\n   AND (:specialization::text = '' OR LOWER(unaccent(\"sz\".\"name\")) LIKE '%' || LOWER(unaccent(:specialization)) || '%')\n   AND (:serviceName::text = ''    OR LOWER(unaccent(\"sn\".\"name\")) LIKE '%' || LOWER(unaccent(:serviceName)) || '%')"};

/**
 * Query generated from SQL:
 * ```
 * SELECT COUNT("s"."id")
 * FROM "services" "s"
 * JOIN "specialists" "sp" ON "s"."specialist_id" = "sp"."id"
 * JOIN "service_names" "sn" ON "s"."service_name_id" = "sn"."id"
 * JOIN "specializations" "sz" ON "sn"."specialization_id" = "sz"."id"
 * WHERE true
 *    AND (:specialist::text = ''     OR LOWER(unaccent("sp"."name")) LIKE '%' || LOWER(unaccent(:specialist)) || '%')
 *    AND (:specialization::text = '' OR LOWER(unaccent("sz"."name")) LIKE '%' || LOWER(unaccent(:specialization)) || '%')
 *    AND (:serviceName::text = ''    OR LOWER(unaccent("sn"."name")) LIKE '%' || LOWER(unaccent(:serviceName)) || '%')
 * ```
 */
export const countServicesEnriched = new PreparedQuery<ICountServicesEnrichedParams,ICountServicesEnrichedResult>(countServicesEnrichedIR);


