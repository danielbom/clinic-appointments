/** Types generated for queries found in "generated/queries/services_available_queries.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'GetServiceAvailableById' parameters type */
export interface IGetServiceAvailableByIdParams {
  serviceNameId?: string | null | void;
}

/** 'GetServiceAvailableById' return type */
export interface IGetServiceAvailableByIdResult {
  service_name: string;
  service_name_id: string;
  specialization: string;
  specialization_id: string;
}

/** 'GetServiceAvailableById' query type */
export interface IGetServiceAvailableByIdQuery {
  params: IGetServiceAvailableByIdParams;
  result: IGetServiceAvailableByIdResult;
}

const getServiceAvailableByIdIR: any = {"usedParamSet":{"serviceNameId":true},"params":[{"name":"serviceNameId","required":false,"transform":{"type":"scalar"},"locs":[{"a":254,"b":267}]}],"statement":"SELECT \"sn\".\"id\" as \"service_name_id\", \"sn\".\"name\" as \"service_name\"\n     , \"sp\".\"id\" as \"specialization_id\", \"sp\".\"name\" as \"specialization\"\nFROM \"service_names\" \"sn\"\nJOIN \"specializations\" \"sp\" ON \"sn\".\"specialization_id\" = \"sp\".\"id\"\nWHERE \"sn\".\"id\" = :serviceNameId"};

/**
 * Query generated from SQL:
 * ```
 * SELECT "sn"."id" as "service_name_id", "sn"."name" as "service_name"
 *      , "sp"."id" as "specialization_id", "sp"."name" as "specialization"
 * FROM "service_names" "sn"
 * JOIN "specializations" "sp" ON "sn"."specialization_id" = "sp"."id"
 * WHERE "sn"."id" = :serviceNameId
 * ```
 */
export const getServiceAvailableById = new PreparedQuery<IGetServiceAvailableByIdParams,IGetServiceAvailableByIdResult>(getServiceAvailableByIdIR);


