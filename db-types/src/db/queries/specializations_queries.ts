/** Types generated for queries found in "generated/queries/specializations_queries.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'CreateSpecialization' parameters type */
export interface ICreateSpecializationParams {
  name?: string | null | void;
}

/** 'CreateSpecialization' return type */
export interface ICreateSpecializationResult {
  id: string;
}

/** 'CreateSpecialization' query type */
export interface ICreateSpecializationQuery {
  params: ICreateSpecializationParams;
  result: ICreateSpecializationResult;
}

const createSpecializationIR: any = {"usedParamSet":{"name":true},"params":[{"name":"name","required":false,"transform":{"type":"scalar"},"locs":[{"a":47,"b":51}]}],"statement":"INSERT INTO \"specializations\" (\"name\")\nVALUES (:name)\nRETURNING \"id\""};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO "specializations" ("name")
 * VALUES (:name)
 * RETURNING "id"
 * ```
 */
export const createSpecialization = new PreparedQuery<ICreateSpecializationParams,ICreateSpecializationResult>(createSpecializationIR);


/** 'UpdateSpecialization' parameters type */
export interface IUpdateSpecializationParams {
  id?: string | null | void;
  name?: string | null | void;
}

/** 'UpdateSpecialization' return type */
export interface IUpdateSpecializationResult {
  id: string;
}

/** 'UpdateSpecialization' query type */
export interface IUpdateSpecializationQuery {
  params: IUpdateSpecializationParams;
  result: IUpdateSpecializationResult;
}

const updateSpecializationIR: any = {"usedParamSet":{"name":true,"id":true},"params":[{"name":"name","required":false,"transform":{"type":"scalar"},"locs":[{"a":40,"b":44}]},{"name":"id","required":false,"transform":{"type":"scalar"},"locs":[{"a":59,"b":61}]}],"statement":"UPDATE \"specializations\"\nSET \n\t\"name\" = :name\nWHERE \"id\" = :id\nRETURNING \"id\""};

/**
 * Query generated from SQL:
 * ```
 * UPDATE "specializations"
 * SET 
 * 	"name" = :name
 * WHERE "id" = :id
 * RETURNING "id"
 * ```
 */
export const updateSpecialization = new PreparedQuery<IUpdateSpecializationParams,IUpdateSpecializationResult>(updateSpecializationIR);


/** 'GetSpecializationById' parameters type */
export interface IGetSpecializationByIdParams {
  specializationId?: string | null | void;
}

/** 'GetSpecializationById' return type */
export interface IGetSpecializationByIdResult {
  id: string;
  name: string;
}

/** 'GetSpecializationById' query type */
export interface IGetSpecializationByIdQuery {
  params: IGetSpecializationByIdParams;
  result: IGetSpecializationByIdResult;
}

const getSpecializationByIdIR: any = {"usedParamSet":{"specializationId":true},"params":[{"name":"specializationId","required":false,"transform":{"type":"scalar"},"locs":[{"a":57,"b":73}]}],"statement":"SELECT \"id\", \"name\"\nFROM \"specializations\" \nWHERE \"id\" = :specializationId"};

/**
 * Query generated from SQL:
 * ```
 * SELECT "id", "name"
 * FROM "specializations" 
 * WHERE "id" = :specializationId
 * ```
 */
export const getSpecializationById = new PreparedQuery<IGetSpecializationByIdParams,IGetSpecializationByIdResult>(getSpecializationByIdIR);


/** 'GetSpecializationByName' parameters type */
export interface IGetSpecializationByNameParams {
  specializationName?: string | null | void;
}

/** 'GetSpecializationByName' return type */
export interface IGetSpecializationByNameResult {
  id: string;
  name: string;
}

/** 'GetSpecializationByName' query type */
export interface IGetSpecializationByNameQuery {
  params: IGetSpecializationByNameParams;
  result: IGetSpecializationByNameResult;
}

const getSpecializationByNameIR: any = {"usedParamSet":{"specializationName":true},"params":[{"name":"specializationName","required":false,"transform":{"type":"scalar"},"locs":[{"a":59,"b":77}]}],"statement":"SELECT \"id\", \"name\"\nFROM \"specializations\" \nWHERE \"name\" = :specializationName"};

/**
 * Query generated from SQL:
 * ```
 * SELECT "id", "name"
 * FROM "specializations" 
 * WHERE "name" = :specializationName
 * ```
 */
export const getSpecializationByName = new PreparedQuery<IGetSpecializationByNameParams,IGetSpecializationByNameResult>(getSpecializationByNameIR);


/** 'ListSpecializations' parameters type */
export type IListSpecializationsParams = void;

/** 'ListSpecializations' return type */
export interface IListSpecializationsResult {
  id: string;
  name: string;
}

/** 'ListSpecializations' query type */
export interface IListSpecializationsQuery {
  params: IListSpecializationsParams;
  result: IListSpecializationsResult;
}

const listSpecializationsIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT \"id\", \"name\"\nFROM \"specializations\"\nORDER BY \"name\""};

/**
 * Query generated from SQL:
 * ```
 * SELECT "id", "name"
 * FROM "specializations"
 * ORDER BY "name"
 * ```
 */
export const listSpecializations = new PreparedQuery<IListSpecializationsParams,IListSpecializationsResult>(listSpecializationsIR);


/** 'ListSpecializationsBySpecialistId' parameters type */
export interface IListSpecializationsBySpecialistIdParams {
  specializationId?: string | null | void;
}

/** 'ListSpecializationsBySpecialistId' return type */
export interface IListSpecializationsBySpecialistIdResult {
  id: string;
  name: string;
}

/** 'ListSpecializationsBySpecialistId' query type */
export interface IListSpecializationsBySpecialistIdQuery {
  params: IListSpecializationsBySpecialistIdParams;
  result: IListSpecializationsBySpecialistIdResult;
}

const listSpecializationsBySpecialistIdIR: any = {"usedParamSet":{"specializationId":true},"params":[{"name":"specializationId","required":false,"transform":{"type":"scalar"},"locs":[{"a":228,"b":244}]}],"statement":"SELECT \"sp\".\"id\", \"sp\".\"name\"\nFROM \"specializations\" \"sp\"\nWHERE \"sp\".\"id\" IN (\n\tSELECT \"sn\".\"specialization_id\" \n\tFROM \"services\" \"s\" \n\tJOIN \"service_names\" \"sn\" ON \"sn\".\"id\" = \"s\".\"service_name_id\"\n\tWHERE \"s\".\"specialist_id\" = :specializationId\n)"};

/**
 * Query generated from SQL:
 * ```
 * SELECT "sp"."id", "sp"."name"
 * FROM "specializations" "sp"
 * WHERE "sp"."id" IN (
 * 	SELECT "sn"."specialization_id" 
 * 	FROM "services" "s" 
 * 	JOIN "service_names" "sn" ON "sn"."id" = "s"."service_name_id"
 * 	WHERE "s"."specialist_id" = :specializationId
 * )
 * ```
 */
export const listSpecializationsBySpecialistId = new PreparedQuery<IListSpecializationsBySpecialistIdParams,IListSpecializationsBySpecialistIdResult>(listSpecializationsBySpecialistIdIR);


/** 'DeleteSpecializationById' parameters type */
export interface IDeleteSpecializationByIdParams {
  specializationId?: string | null | void;
}

/** 'DeleteSpecializationById' return type */
export type IDeleteSpecializationByIdResult = void;

/** 'DeleteSpecializationById' query type */
export interface IDeleteSpecializationByIdQuery {
  params: IDeleteSpecializationByIdParams;
  result: IDeleteSpecializationByIdResult;
}

const deleteSpecializationByIdIR: any = {"usedParamSet":{"specializationId":true},"params":[{"name":"specializationId","required":false,"transform":{"type":"scalar"},"locs":[{"a":43,"b":59}]}],"statement":"DELETE FROM \"specializations\"\nWHERE \"id\" = :specializationId"};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM "specializations"
 * WHERE "id" = :specializationId
 * ```
 */
export const deleteSpecializationById = new PreparedQuery<IDeleteSpecializationByIdParams,IDeleteSpecializationByIdResult>(deleteSpecializationByIdIR);


