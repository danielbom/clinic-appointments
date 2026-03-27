/** Types generated for queries found in "generated/queries/service_names_queries.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'CreateServiceName' parameters type */
export interface ICreateServiceNameParams {
  name?: string | null | void;
  specializationId?: string | null | void;
}

/** 'CreateServiceName' return type */
export interface ICreateServiceNameResult {
  id: string;
}

/** 'CreateServiceName' query type */
export interface ICreateServiceNameQuery {
  params: ICreateServiceNameParams;
  result: ICreateServiceNameResult;
}

const createServiceNameIR: any = {"usedParamSet":{"name":true,"specializationId":true},"params":[{"name":"name","required":false,"transform":{"type":"scalar"},"locs":[{"a":67,"b":71}]},{"name":"specializationId","required":false,"transform":{"type":"scalar"},"locs":[{"a":82,"b":98}]}],"statement":"INSERT INTO \"service_names\" (\"name\", \"specialization_id\")\nVALUES ( :name\n       , :specializationId\n       )\nRETURNING \"id\""};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO "service_names" ("name", "specialization_id")
 * VALUES ( :name
 *        , :specializationId
 *        )
 * RETURNING "id"
 * ```
 */
export const createServiceName = new PreparedQuery<ICreateServiceNameParams,ICreateServiceNameResult>(createServiceNameIR);


/** 'UpdateServiceName' parameters type */
export interface IUpdateServiceNameParams {
  id?: string | null | void;
  name?: string | null | void;
}

/** 'UpdateServiceName' return type */
export interface IUpdateServiceNameResult {
  id: string;
}

/** 'UpdateServiceName' query type */
export interface IUpdateServiceNameQuery {
  params: IUpdateServiceNameParams;
  result: IUpdateServiceNameResult;
}

const updateServiceNameIR: any = {"usedParamSet":{"name":true,"id":true},"params":[{"name":"name","required":false,"transform":{"type":"scalar"},"locs":[{"a":40,"b":44}]},{"name":"id","required":false,"transform":{"type":"scalar"},"locs":[{"a":59,"b":61}]}],"statement":"UPDATE \"service_names\"\nSET\n    \"name\" = :name\nWHERE \"id\" = :id\nRETURNING \"id\""};

/**
 * Query generated from SQL:
 * ```
 * UPDATE "service_names"
 * SET
 *     "name" = :name
 * WHERE "id" = :id
 * RETURNING "id"
 * ```
 */
export const updateServiceName = new PreparedQuery<IUpdateServiceNameParams,IUpdateServiceNameResult>(updateServiceNameIR);


/** 'GetServiceNameByName' parameters type */
export interface IGetServiceNameByNameParams {
  serviceName?: string | null | void;
}

/** 'GetServiceNameByName' return type */
export interface IGetServiceNameByNameResult {
  id: string;
  name: string;
  specialization_id: string;
}

/** 'GetServiceNameByName' query type */
export interface IGetServiceNameByNameQuery {
  params: IGetServiceNameByNameParams;
  result: IGetServiceNameByNameResult;
}

const getServiceNameByNameIR: any = {"usedParamSet":{"serviceName":true},"params":[{"name":"serviceName","required":false,"transform":{"type":"scalar"},"locs":[{"a":78,"b":89}]}],"statement":"SELECT \"id\", \"name\", \"specialization_id\"\nFROM \"service_names\" \nWHERE \"name\" = :serviceName"};

/**
 * Query generated from SQL:
 * ```
 * SELECT "id", "name", "specialization_id"
 * FROM "service_names" 
 * WHERE "name" = :serviceName
 * ```
 */
export const getServiceNameByName = new PreparedQuery<IGetServiceNameByNameParams,IGetServiceNameByNameResult>(getServiceNameByNameIR);


/** 'GetServiceNameById' parameters type */
export interface IGetServiceNameByIdParams {
  serviceNameId?: string | null | void;
}

/** 'GetServiceNameById' return type */
export interface IGetServiceNameByIdResult {
  id: string;
  name: string;
  specialization_id: string;
}

/** 'GetServiceNameById' query type */
export interface IGetServiceNameByIdQuery {
  params: IGetServiceNameByIdParams;
  result: IGetServiceNameByIdResult;
}

const getServiceNameByIdIR: any = {"usedParamSet":{"serviceNameId":true},"params":[{"name":"serviceNameId","required":false,"transform":{"type":"scalar"},"locs":[{"a":76,"b":89}]}],"statement":"SELECT \"id\", \"name\", \"specialization_id\"\nFROM \"service_names\" \nWHERE \"id\" = :serviceNameId"};

/**
 * Query generated from SQL:
 * ```
 * SELECT "id", "name", "specialization_id"
 * FROM "service_names" 
 * WHERE "id" = :serviceNameId
 * ```
 */
export const getServiceNameById = new PreparedQuery<IGetServiceNameByIdParams,IGetServiceNameByIdResult>(getServiceNameByIdIR);


/** 'ListServiceNames' parameters type */
export type IListServiceNamesParams = void;

/** 'ListServiceNames' return type */
export interface IListServiceNamesResult {
  id: string;
  name: string;
  specialization_id: string;
}

/** 'ListServiceNames' query type */
export interface IListServiceNamesQuery {
  params: IListServiceNamesParams;
  result: IListServiceNamesResult;
}

const listServiceNamesIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT \"id\", \"name\", \"specialization_id\"\nFROM \"service_names\"\nORDER BY \"name\""};

/**
 * Query generated from SQL:
 * ```
 * SELECT "id", "name", "specialization_id"
 * FROM "service_names"
 * ORDER BY "name"
 * ```
 */
export const listServiceNames = new PreparedQuery<IListServiceNamesParams,IListServiceNamesResult>(listServiceNamesIR);


/** 'DeleteServiceNameById' parameters type */
export interface IDeleteServiceNameByIdParams {
  serviceNameId?: string | null | void;
}

/** 'DeleteServiceNameById' return type */
export type IDeleteServiceNameByIdResult = void;

/** 'DeleteServiceNameById' query type */
export interface IDeleteServiceNameByIdQuery {
  params: IDeleteServiceNameByIdParams;
  result: IDeleteServiceNameByIdResult;
}

const deleteServiceNameByIdIR: any = {"usedParamSet":{"serviceNameId":true},"params":[{"name":"serviceNameId","required":false,"transform":{"type":"scalar"},"locs":[{"a":41,"b":54}]}],"statement":"DELETE FROM \"service_names\"\nWHERE \"id\" = :serviceNameId"};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM "service_names"
 * WHERE "id" = :serviceNameId
 * ```
 */
export const deleteServiceNameById = new PreparedQuery<IDeleteServiceNameByIdParams,IDeleteServiceNameByIdResult>(deleteServiceNameByIdIR);


