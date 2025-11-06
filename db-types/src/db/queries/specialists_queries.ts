/** Types generated for queries found in "generated/queries/specialists_queries.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'CreateSpecialist' parameters type */
export interface ICreateSpecialistParams {
  birthdate?: string | null | void;
  cnpj?: string | null | void;
  cpf?: string | null | void;
  email?: string | null | void;
  name?: string | null | void;
  phone?: string | null | void;
}

/** 'CreateSpecialist' return type */
export interface ICreateSpecialistResult {
  id: string;
}

/** 'CreateSpecialist' query type */
export interface ICreateSpecialistQuery {
  params: ICreateSpecialistParams;
  result: ICreateSpecialistResult;
}

const createSpecialistIR: any = {"usedParamSet":{"name":true,"email":true,"phone":true,"birthdate":true,"cpf":true,"cnpj":true},"params":[{"name":"name","required":false,"transform":{"type":"scalar"},"locs":[{"a":88,"b":92}]},{"name":"email","required":false,"transform":{"type":"scalar"},"locs":[{"a":103,"b":108}]},{"name":"phone","required":false,"transform":{"type":"scalar"},"locs":[{"a":119,"b":124}]},{"name":"birthdate","required":false,"transform":{"type":"scalar"},"locs":[{"a":135,"b":144}]},{"name":"cpf","required":false,"transform":{"type":"scalar"},"locs":[{"a":155,"b":158}]},{"name":"cnpj","required":false,"transform":{"type":"scalar"},"locs":[{"a":169,"b":173}]}],"statement":"INSERT INTO specialists (\"name\", \"email\", \"phone\", \"birthdate\", \"cpf\", \"cnpj\")\nVALUES ( :name\n       , :email\n       , :phone\n       , :birthdate\n       , :cpf\n       , :cnpj\n       )\nRETURNING \"id\""};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO specialists ("name", "email", "phone", "birthdate", "cpf", "cnpj")
 * VALUES ( :name
 *        , :email
 *        , :phone
 *        , :birthdate
 *        , :cpf
 *        , :cnpj
 *        )
 * RETURNING "id"
 * ```
 */
export const createSpecialist = new PreparedQuery<ICreateSpecialistParams,ICreateSpecialistResult>(createSpecialistIR);


/** 'CountSpecialists' parameters type */
export type ICountSpecialistsParams = void;

/** 'CountSpecialists' return type */
export interface ICountSpecialistsResult {
  count: string | null;
}

/** 'CountSpecialists' query type */
export interface ICountSpecialistsQuery {
  params: ICountSpecialistsParams;
  result: ICountSpecialistsResult;
}

const countSpecialistsIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT COUNT(\"s\".\"id\")\nFROM \"specialists\" \"s\""};

/**
 * Query generated from SQL:
 * ```
 * SELECT COUNT("s"."id")
 * FROM "specialists" "s"
 * ```
 */
export const countSpecialists = new PreparedQuery<ICountSpecialistsParams,ICountSpecialistsResult>(countSpecialistsIR);


/** 'UpdateSpecialist' parameters type */
export interface IUpdateSpecialistParams {
  birthdate?: string | null | void;
  cnpj?: string | null | void;
  cpf?: string | null | void;
  email?: string | null | void;
  id?: string | null | void;
  name?: string | null | void;
  phone?: string | null | void;
}

/** 'UpdateSpecialist' return type */
export interface IUpdateSpecialistResult {
  birthdate: string;
  cnpj: string | null;
  cpf: string;
  email: string;
  id: string;
  name: string;
  phone: string;
}

/** 'UpdateSpecialist' query type */
export interface IUpdateSpecialistQuery {
  params: IUpdateSpecialistParams;
  result: IUpdateSpecialistResult;
}

const updateSpecialistIR: any = {"usedParamSet":{"name":true,"email":true,"phone":true,"birthdate":true,"cpf":true,"cnpj":true,"id":true},"params":[{"name":"name","required":false,"transform":{"type":"scalar"},"locs":[{"a":42,"b":46}]},{"name":"email","required":false,"transform":{"type":"scalar"},"locs":[{"a":65,"b":70}]},{"name":"phone","required":false,"transform":{"type":"scalar"},"locs":[{"a":89,"b":94}]},{"name":"birthdate","required":false,"transform":{"type":"scalar"},"locs":[{"a":113,"b":122}]},{"name":"cpf","required":false,"transform":{"type":"scalar"},"locs":[{"a":141,"b":144}]},{"name":"cnpj","required":false,"transform":{"type":"scalar"},"locs":[{"a":163,"b":167}]},{"name":"id","required":false,"transform":{"type":"scalar"},"locs":[{"a":182,"b":184}]}],"statement":"UPDATE \"specialists\"\nSET \n  \"name\"      = :name,\n  \"email\"     = :email,\n  \"phone\"     = :phone,\n  \"birthdate\" = :birthdate,\n  \"cpf\"       = :cpf,\n  \"cnpj\"      = :cnpj\nWHERE \"id\" = :id\nRETURNING \"id\", \"name\", \"email\", \"phone\", \"birthdate\", \"cpf\", \"cnpj\""};

/**
 * Query generated from SQL:
 * ```
 * UPDATE "specialists"
 * SET 
 *   "name"      = :name,
 *   "email"     = :email,
 *   "phone"     = :phone,
 *   "birthdate" = :birthdate,
 *   "cpf"       = :cpf,
 *   "cnpj"      = :cnpj
 * WHERE "id" = :id
 * RETURNING "id", "name", "email", "phone", "birthdate", "cpf", "cnpj"
 * ```
 */
export const updateSpecialist = new PreparedQuery<IUpdateSpecialistParams,IUpdateSpecialistResult>(updateSpecialistIR);


/** 'GetSpecialistById' parameters type */
export interface IGetSpecialistByIdParams {
  specialistId?: string | null | void;
}

/** 'GetSpecialistById' return type */
export interface IGetSpecialistByIdResult {
  birthdate: string;
  cnpj: string | null;
  cpf: string;
  email: string;
  id: string;
  name: string;
  phone: string;
}

/** 'GetSpecialistById' query type */
export interface IGetSpecialistByIdQuery {
  params: IGetSpecialistByIdParams;
  result: IGetSpecialistByIdResult;
}

const getSpecialistByIdIR: any = {"usedParamSet":{"specialistId":true},"params":[{"name":"specialistId","required":false,"transform":{"type":"scalar"},"locs":[{"a":98,"b":110}]}],"statement":"SELECT \"id\", \"name\", \"email\", \"phone\", \"birthdate\", \"cpf\", \"cnpj\"\nFROM \"specialists\"\nWHERE \"id\" = :specialistId\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT "id", "name", "email", "phone", "birthdate", "cpf", "cnpj"
 * FROM "specialists"
 * WHERE "id" = :specialistId
 * LIMIT 1
 * ```
 */
export const getSpecialistById = new PreparedQuery<IGetSpecialistByIdParams,IGetSpecialistByIdResult>(getSpecialistByIdIR);


/** 'GetSpecialistByEmail' parameters type */
export interface IGetSpecialistByEmailParams {
  specialistEmail?: string | null | void;
}

/** 'GetSpecialistByEmail' return type */
export interface IGetSpecialistByEmailResult {
  birthdate: string;
  cnpj: string | null;
  cpf: string;
  email: string;
  id: string;
  name: string;
  phone: string;
}

/** 'GetSpecialistByEmail' query type */
export interface IGetSpecialistByEmailQuery {
  params: IGetSpecialistByEmailParams;
  result: IGetSpecialistByEmailResult;
}

const getSpecialistByEmailIR: any = {"usedParamSet":{"specialistEmail":true},"params":[{"name":"specialistEmail","required":false,"transform":{"type":"scalar"},"locs":[{"a":101,"b":116}]}],"statement":"SELECT \"id\", \"name\", \"email\", \"phone\", \"birthdate\", \"cpf\", \"cnpj\"\nFROM \"specialists\"\nWHERE \"email\" = :specialistEmail\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT "id", "name", "email", "phone", "birthdate", "cpf", "cnpj"
 * FROM "specialists"
 * WHERE "email" = :specialistEmail
 * LIMIT 1
 * ```
 */
export const getSpecialistByEmail = new PreparedQuery<IGetSpecialistByEmailParams,IGetSpecialistByEmailResult>(getSpecialistByEmailIR);


/** 'ListSpecialists' parameters type */
export interface IListSpecialistsParams {
  limit?: number | null | void;
  offset?: number | null | void;
}

/** 'ListSpecialists' return type */
export interface IListSpecialistsResult {
  birthdate: string;
  cnpj: string | null;
  cpf: string;
  email: string;
  id: string;
  name: string;
  phone: string;
}

/** 'ListSpecialists' query type */
export interface IListSpecialistsQuery {
  params: IListSpecialistsParams;
  result: IListSpecialistsResult;
}

const listSpecialistsIR: any = {"usedParamSet":{"limit":true,"offset":true},"params":[{"name":"limit","required":false,"transform":{"type":"scalar"},"locs":[{"a":91,"b":96}]},{"name":"offset","required":false,"transform":{"type":"scalar"},"locs":[{"a":114,"b":120}]}],"statement":"SELECT \"id\", \"name\", \"email\", \"phone\", \"birthdate\", \"cpf\", \"cnpj\"\nFROM \"specialists\"\nLIMIT :limit::integer\nOFFSET :offset::integer"};

/**
 * Query generated from SQL:
 * ```
 * SELECT "id", "name", "email", "phone", "birthdate", "cpf", "cnpj"
 * FROM "specialists"
 * LIMIT :limit::integer
 * OFFSET :offset::integer
 * ```
 */
export const listSpecialists = new PreparedQuery<IListSpecialistsParams,IListSpecialistsResult>(listSpecialistsIR);


/** 'DeleteSpecialistById' parameters type */
export interface IDeleteSpecialistByIdParams {
  specialistId?: string | null | void;
}

/** 'DeleteSpecialistById' return type */
export type IDeleteSpecialistByIdResult = void;

/** 'DeleteSpecialistById' query type */
export interface IDeleteSpecialistByIdQuery {
  params: IDeleteSpecialistByIdParams;
  result: IDeleteSpecialistByIdResult;
}

const deleteSpecialistByIdIR: any = {"usedParamSet":{"specialistId":true},"params":[{"name":"specialistId","required":false,"transform":{"type":"scalar"},"locs":[{"a":39,"b":51}]}],"statement":"DELETE FROM \"specialists\"\nWHERE \"id\" = :specialistId"};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM "specialists"
 * WHERE "id" = :specialistId
 * ```
 */
export const deleteSpecialistById = new PreparedQuery<IDeleteSpecialistByIdParams,IDeleteSpecialistByIdResult>(deleteSpecialistByIdIR);


/** 'ListServicesBySpecialistId' parameters type */
export interface IListServicesBySpecialistIdParams {
  specialistId?: string | null | void;
}

/** 'ListServicesBySpecialistId' return type */
export interface IListServicesBySpecialistIdResult {
  duration: number;
  id: string;
  price: number;
  service_name: string;
  service_name_id: string;
  specialization_id: string;
}

/** 'ListServicesBySpecialistId' query type */
export interface IListServicesBySpecialistIdQuery {
  params: IListServicesBySpecialistIdParams;
  result: IListServicesBySpecialistIdResult;
}

const listServicesBySpecialistIdIR: any = {"usedParamSet":{"specialistId":true},"params":[{"name":"specialistId","required":false,"transform":{"type":"scalar"},"locs":[{"a":261,"b":273}]}],"statement":"SELECT \"s\".\"id\",\n    \"sn\".\"specialization_id\",\n    \"sn\".\"id\" as \"service_name_id\",\n    \"sn\".\"name\" as \"service_name\",\n    \"s\".\"price\", \"s\".\"duration\"\nFROM \"services\" \"s\"\nJOIN \"service_names\" \"sn\" ON \"sn\".\"id\" = \"s\".\"service_name_id\"\nWHERE \"s\".\"specialist_id\" = :specialistId"};

/**
 * Query generated from SQL:
 * ```
 * SELECT "s"."id",
 *     "sn"."specialization_id",
 *     "sn"."id" as "service_name_id",
 *     "sn"."name" as "service_name",
 *     "s"."price", "s"."duration"
 * FROM "services" "s"
 * JOIN "service_names" "sn" ON "sn"."id" = "s"."service_name_id"
 * WHERE "s"."specialist_id" = :specialistId
 * ```
 */
export const listServicesBySpecialistId = new PreparedQuery<IListServicesBySpecialistIdParams,IListServicesBySpecialistIdResult>(listServicesBySpecialistIdIR);


