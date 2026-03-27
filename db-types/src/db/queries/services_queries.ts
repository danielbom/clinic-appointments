/** Types generated for queries found in "generated/queries/services_queries.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'CreateService' parameters type */
export interface ICreateServiceParams {
  duration?: number | null | void;
  price?: number | null | void;
  serviceNameId?: string | null | void;
  specialistId?: string | null | void;
}

/** 'CreateService' return type */
export interface ICreateServiceResult {
  id: string;
}

/** 'CreateService' query type */
export interface ICreateServiceQuery {
  params: ICreateServiceParams;
  result: ICreateServiceResult;
}

const createServiceIR: any = {"usedParamSet":{"serviceNameId":true,"specialistId":true,"price":true,"duration":true},"params":[{"name":"serviceNameId","required":false,"transform":{"type":"scalar"},"locs":[{"a":88,"b":101}]},{"name":"specialistId","required":false,"transform":{"type":"scalar"},"locs":[{"a":112,"b":124}]},{"name":"price","required":false,"transform":{"type":"scalar"},"locs":[{"a":135,"b":140}]},{"name":"duration","required":false,"transform":{"type":"scalar"},"locs":[{"a":151,"b":159}]}],"statement":"INSERT INTO services (\"service_name_id\", \"specialist_id\", \"price\", \"duration\")\nVALUES ( :serviceNameId\n       , :specialistId\n       , :price\n       , :duration\n       )\nRETURNING \"id\""};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO services ("service_name_id", "specialist_id", "price", "duration")
 * VALUES ( :serviceNameId
 *        , :specialistId
 *        , :price
 *        , :duration
 *        )
 * RETURNING "id"
 * ```
 */
export const createService = new PreparedQuery<ICreateServiceParams,ICreateServiceResult>(createServiceIR);


/** 'UpdateService' parameters type */
export interface IUpdateServiceParams {
  duration?: number | null | void;
  id?: string | null | void;
  price?: number | null | void;
}

/** 'UpdateService' return type */
export interface IUpdateServiceResult {
  id: string;
}

/** 'UpdateService' query type */
export interface IUpdateServiceQuery {
  params: IUpdateServiceParams;
  result: IUpdateServiceResult;
}

const updateServiceIR: any = {"usedParamSet":{"price":true,"duration":true,"id":true},"params":[{"name":"price","required":false,"transform":{"type":"scalar"},"locs":[{"a":40,"b":45}]},{"name":"duration","required":false,"transform":{"type":"scalar"},"locs":[{"a":65,"b":73}]},{"name":"id","required":false,"transform":{"type":"scalar"},"locs":[{"a":88,"b":90}]}],"statement":"UPDATE \"services\" \nSET\n    \"price\"    = :price,\n    \"duration\" = :duration\nWHERE \"id\" = :id\nRETURNING \"id\""};

/**
 * Query generated from SQL:
 * ```
 * UPDATE "services" 
 * SET
 *     "price"    = :price,
 *     "duration" = :duration
 * WHERE "id" = :id
 * RETURNING "id"
 * ```
 */
export const updateService = new PreparedQuery<IUpdateServiceParams,IUpdateServiceResult>(updateServiceIR);


/** 'GetService' parameters type */
export interface IGetServiceParams {
  serviceNameId?: string | null | void;
  specialistId?: string | null | void;
}

/** 'GetService' return type */
export interface IGetServiceResult {
  duration: number;
  id: string;
  price: number;
  service_name_id: string;
  specialist_id: string;
}

/** 'GetService' query type */
export interface IGetServiceQuery {
  params: IGetServiceParams;
  result: IGetServiceResult;
}

const getServiceIR: any = {"usedParamSet":{"serviceNameId":true,"specialistId":true},"params":[{"name":"serviceNameId","required":false,"transform":{"type":"scalar"},"locs":[{"a":109,"b":122}]},{"name":"specialistId","required":false,"transform":{"type":"scalar"},"locs":[{"a":146,"b":158}]}],"statement":"SELECT \"id\", \"service_name_id\", \"specialist_id\", \"price\", \"duration\"\nFROM services\nWHERE \"service_name_id\" = :serviceNameId AND \"specialist_id\" = :specialistId"};

/**
 * Query generated from SQL:
 * ```
 * SELECT "id", "service_name_id", "specialist_id", "price", "duration"
 * FROM services
 * WHERE "service_name_id" = :serviceNameId AND "specialist_id" = :specialistId
 * ```
 */
export const getService = new PreparedQuery<IGetServiceParams,IGetServiceResult>(getServiceIR);


/** 'GetServiceById' parameters type */
export interface IGetServiceByIdParams {
  serviceId?: string | null | void;
}

/** 'GetServiceById' return type */
export interface IGetServiceByIdResult {
  duration: number;
  id: string;
  price: number;
  service_name_id: string;
  specialist_id: string;
}

/** 'GetServiceById' query type */
export interface IGetServiceByIdQuery {
  params: IGetServiceByIdParams;
  result: IGetServiceByIdResult;
}

const getServiceByIdIR: any = {"usedParamSet":{"serviceId":true},"params":[{"name":"serviceId","required":false,"transform":{"type":"scalar"},"locs":[{"a":96,"b":105}]}],"statement":"SELECT \"id\", \"service_name_id\", \"specialist_id\", \"price\", \"duration\"\nFROM services\nWHERE \"id\" = :serviceId"};

/**
 * Query generated from SQL:
 * ```
 * SELECT "id", "service_name_id", "specialist_id", "price", "duration"
 * FROM services
 * WHERE "id" = :serviceId
 * ```
 */
export const getServiceById = new PreparedQuery<IGetServiceByIdParams,IGetServiceByIdResult>(getServiceByIdIR);


/** 'DeleteService' parameters type */
export interface IDeleteServiceParams {
  serviceId?: string | null | void;
}

/** 'DeleteService' return type */
export type IDeleteServiceResult = void;

/** 'DeleteService' query type */
export interface IDeleteServiceQuery {
  params: IDeleteServiceParams;
  result: IDeleteServiceResult;
}

const deleteServiceIR: any = {"usedParamSet":{"serviceId":true},"params":[{"name":"serviceId","required":false,"transform":{"type":"scalar"},"locs":[{"a":36,"b":45}]}],"statement":"DELETE FROM \"services\"\nWHERE \"id\" = :serviceId"};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM "services"
 * WHERE "id" = :serviceId
 * ```
 */
export const deleteService = new PreparedQuery<IDeleteServiceParams,IDeleteServiceResult>(deleteServiceIR);


