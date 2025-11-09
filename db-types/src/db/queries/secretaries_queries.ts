/** Types generated for queries found in "generated/queries/secretaries_queries.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'CreateSecretary' parameters type */
export interface ICreateSecretaryParams {
  birthdate?: string | null | void;
  cnpj?: string | null | void;
  cpf?: string | null | void;
  email?: string | null | void;
  name?: string | null | void;
  password?: string | null | void;
  phone?: string | null | void;
}

/** 'CreateSecretary' return type */
export interface ICreateSecretaryResult {
  birthdate: string;
  cnpj: string | null;
  cpf: string;
  email: string;
  id: string;
  name: string;
  password: string;
  phone: string;
}

/** 'CreateSecretary' query type */
export interface ICreateSecretaryQuery {
  params: ICreateSecretaryParams;
  result: ICreateSecretaryResult;
}

const createSecretaryIR: any = {"usedParamSet":{"name":true,"email":true,"password":true,"phone":true,"birthdate":true,"cpf":true,"cnpj":true},"params":[{"name":"name","required":false,"transform":{"type":"scalar"},"locs":[{"a":102,"b":106}]},{"name":"email","required":false,"transform":{"type":"scalar"},"locs":[{"a":117,"b":122}]},{"name":"password","required":false,"transform":{"type":"scalar"},"locs":[{"a":133,"b":141}]},{"name":"phone","required":false,"transform":{"type":"scalar"},"locs":[{"a":152,"b":157}]},{"name":"birthdate","required":false,"transform":{"type":"scalar"},"locs":[{"a":168,"b":177}]},{"name":"cpf","required":false,"transform":{"type":"scalar"},"locs":[{"a":188,"b":191}]},{"name":"cnpj","required":false,"transform":{"type":"scalar"},"locs":[{"a":202,"b":206}]}],"statement":"INSERT INTO \"secretaries\" (\"name\", \"email\", \"password\", \"phone\", \"birthdate\", \"cpf\", \"cnpj\")\nVALUES ( :name\n       , :email\n       , :password\n       , :phone\n       , :birthdate\n       , :cpf\n       , :cnpj\n       )\nRETURNING \"id\", \"name\", \"email\", \"password\", \"phone\", \"birthdate\", \"cpf\", \"cnpj\""};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO "secretaries" ("name", "email", "password", "phone", "birthdate", "cpf", "cnpj")
 * VALUES ( :name
 *        , :email
 *        , :password
 *        , :phone
 *        , :birthdate
 *        , :cpf
 *        , :cnpj
 *        )
 * RETURNING "id", "name", "email", "password", "phone", "birthdate", "cpf", "cnpj"
 * ```
 */
export const createSecretary = new PreparedQuery<ICreateSecretaryParams,ICreateSecretaryResult>(createSecretaryIR);


/** 'UpdateSecretary' parameters type */
export interface IUpdateSecretaryParams {
  birthdate?: string | null | void;
  cnpj?: string | null | void;
  cpf?: string | null | void;
  email?: string | null | void;
  id?: string | null | void;
  name?: string | null | void;
  password?: string | null | void;
  phone?: string | null | void;
}

/** 'UpdateSecretary' return type */
export interface IUpdateSecretaryResult {
  birthdate: string;
  cnpj: string | null;
  cpf: string;
  email: string;
  id: string;
  name: string;
  password: string;
  phone: string;
}

/** 'UpdateSecretary' query type */
export interface IUpdateSecretaryQuery {
  params: IUpdateSecretaryParams;
  result: IUpdateSecretaryResult;
}

const updateSecretaryIR: any = {"usedParamSet":{"name":true,"email":true,"password":true,"phone":true,"birthdate":true,"cpf":true,"cnpj":true,"id":true},"params":[{"name":"name","required":false,"transform":{"type":"scalar"},"locs":[{"a":41,"b":45}]},{"name":"email","required":false,"transform":{"type":"scalar"},"locs":[{"a":64,"b":69}]},{"name":"password","required":false,"transform":{"type":"scalar"},"locs":[{"a":88,"b":96}]},{"name":"phone","required":false,"transform":{"type":"scalar"},"locs":[{"a":115,"b":120}]},{"name":"birthdate","required":false,"transform":{"type":"scalar"},"locs":[{"a":139,"b":148}]},{"name":"cpf","required":false,"transform":{"type":"scalar"},"locs":[{"a":167,"b":170}]},{"name":"cnpj","required":false,"transform":{"type":"scalar"},"locs":[{"a":189,"b":193}]},{"name":"id","required":false,"transform":{"type":"scalar"},"locs":[{"a":208,"b":210}]}],"statement":"UPDATE \"secretaries\"\nSET\n  \"name\"      = :name,\n  \"email\"     = :email,\n  \"password\"  = :password,\n  \"phone\"     = :phone,\n  \"birthdate\" = :birthdate,\n  \"cpf\"       = :cpf,\n  \"cnpj\"      = :cnpj\nWHERE \"id\" = :id\nRETURNING \"id\", \"name\", \"email\", \"password\", \"phone\", \"birthdate\", \"cpf\", \"cnpj\""};

/**
 * Query generated from SQL:
 * ```
 * UPDATE "secretaries"
 * SET
 *   "name"      = :name,
 *   "email"     = :email,
 *   "password"  = :password,
 *   "phone"     = :phone,
 *   "birthdate" = :birthdate,
 *   "cpf"       = :cpf,
 *   "cnpj"      = :cnpj
 * WHERE "id" = :id
 * RETURNING "id", "name", "email", "password", "phone", "birthdate", "cpf", "cnpj"
 * ```
 */
export const updateSecretary = new PreparedQuery<IUpdateSecretaryParams,IUpdateSecretaryResult>(updateSecretaryIR);


/** 'GetSecretaryById' parameters type */
export interface IGetSecretaryByIdParams {
  secretaryId?: string | null | void;
}

/** 'GetSecretaryById' return type */
export interface IGetSecretaryByIdResult {
  birthdate: string;
  cnpj: string | null;
  cpf: string;
  email: string;
  id: string;
  name: string;
  password: string;
  phone: string;
}

/** 'GetSecretaryById' query type */
export interface IGetSecretaryByIdQuery {
  params: IGetSecretaryByIdParams;
  result: IGetSecretaryByIdResult;
}

const getSecretaryByIdIR: any = {"usedParamSet":{"secretaryId":true},"params":[{"name":"secretaryId","required":false,"transform":{"type":"scalar"},"locs":[{"a":110,"b":121}]}],"statement":"SELECT \"id\", \"name\", \"email\", \"password\", \"phone\", \"birthdate\", \"cpf\", \"cnpj\"\nFROM \"secretaries\"\nWHERE \"id\" = :secretaryId\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT "id", "name", "email", "password", "phone", "birthdate", "cpf", "cnpj"
 * FROM "secretaries"
 * WHERE "id" = :secretaryId
 * LIMIT 1
 * ```
 */
export const getSecretaryById = new PreparedQuery<IGetSecretaryByIdParams,IGetSecretaryByIdResult>(getSecretaryByIdIR);


/** 'GetSecretaryByEmail' parameters type */
export interface IGetSecretaryByEmailParams {
  secretaryId?: string | null | void;
}

/** 'GetSecretaryByEmail' return type */
export interface IGetSecretaryByEmailResult {
  birthdate: string;
  cnpj: string | null;
  cpf: string;
  email: string;
  id: string;
  name: string;
  password: string;
  phone: string;
}

/** 'GetSecretaryByEmail' query type */
export interface IGetSecretaryByEmailQuery {
  params: IGetSecretaryByEmailParams;
  result: IGetSecretaryByEmailResult;
}

const getSecretaryByEmailIR: any = {"usedParamSet":{"secretaryId":true},"params":[{"name":"secretaryId","required":false,"transform":{"type":"scalar"},"locs":[{"a":113,"b":124}]}],"statement":"SELECT \"id\", \"name\", \"email\", \"password\", \"phone\", \"birthdate\", \"cpf\", \"cnpj\"\nFROM \"secretaries\"\nWHERE \"email\" = :secretaryId\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT "id", "name", "email", "password", "phone", "birthdate", "cpf", "cnpj"
 * FROM "secretaries"
 * WHERE "email" = :secretaryId
 * LIMIT 1
 * ```
 */
export const getSecretaryByEmail = new PreparedQuery<IGetSecretaryByEmailParams,IGetSecretaryByEmailResult>(getSecretaryByEmailIR);


/** 'ListSecretaries' parameters type */
export interface IListSecretariesParams {
  cpf?: string | null | void;
  limit?: number | null | void;
  name?: string | null | void;
  offset?: number | null | void;
  phone?: string | null | void;
}

/** 'ListSecretaries' return type */
export interface IListSecretariesResult {
  birthdate: string;
  cnpj: string | null;
  cpf: string;
  email: string;
  id: string;
  name: string;
  password: string;
  phone: string;
}

/** 'ListSecretaries' query type */
export interface IListSecretariesQuery {
  params: IListSecretariesParams;
  result: IListSecretariesResult;
}

const listSecretariesIR: any = {"usedParamSet":{"name":true,"cpf":true,"phone":true,"limit":true,"offset":true},"params":[{"name":"name","required":false,"transform":{"type":"scalar"},"locs":[{"a":115,"b":119},{"a":156,"b":160}]},{"name":"cpf","required":false,"transform":{"type":"scalar"},"locs":[{"a":177,"b":180},{"a":206,"b":209}]},{"name":"phone","required":false,"transform":{"type":"scalar"},"locs":[{"a":219,"b":224},{"a":250,"b":255}]},{"name":"limit","required":false,"transform":{"type":"scalar"},"locs":[{"a":264,"b":269}]},{"name":"offset","required":false,"transform":{"type":"scalar"},"locs":[{"a":287,"b":293}]}],"statement":"SELECT \"id\", \"name\", \"email\", \"password\", \"phone\", \"birthdate\", \"cpf\", \"cnpj\"\nFROM \"secretaries\"\nWHERE true\n  AND (:name::text = ''  OR \"name\" ILIKE '%' || :name || '%')\n  AND (:cpf::text = ''   OR \"cpf\" = :cpf)\n  AND (:phone::text = '' OR \"phone\" = :phone)\nLIMIT :limit::integer\nOFFSET :offset::integer"};

/**
 * Query generated from SQL:
 * ```
 * SELECT "id", "name", "email", "password", "phone", "birthdate", "cpf", "cnpj"
 * FROM "secretaries"
 * WHERE true
 *   AND (:name::text = ''  OR "name" ILIKE '%' || :name || '%')
 *   AND (:cpf::text = ''   OR "cpf" = :cpf)
 *   AND (:phone::text = '' OR "phone" = :phone)
 * LIMIT :limit::integer
 * OFFSET :offset::integer
 * ```
 */
export const listSecretaries = new PreparedQuery<IListSecretariesParams,IListSecretariesResult>(listSecretariesIR);


/** 'CountSecretaries' parameters type */
export interface ICountSecretariesParams {
  cpf?: string | null | void;
  name?: string | null | void;
  phone?: string | null | void;
}

/** 'CountSecretaries' return type */
export interface ICountSecretariesResult {
  count: number | null;
}

/** 'CountSecretaries' query type */
export interface ICountSecretariesQuery {
  params: ICountSecretariesParams;
  result: ICountSecretariesResult;
}

const countSecretariesIR: any = {"usedParamSet":{"name":true,"cpf":true,"phone":true},"params":[{"name":"name","required":false,"transform":{"type":"scalar"},"locs":[{"a":68,"b":72},{"a":109,"b":113}]},{"name":"cpf","required":false,"transform":{"type":"scalar"},"locs":[{"a":130,"b":133},{"a":159,"b":162}]},{"name":"phone","required":false,"transform":{"type":"scalar"},"locs":[{"a":172,"b":177},{"a":203,"b":208}]}],"statement":"SELECT COUNT(id)::int as count\nFROM \"secretaries\"\nWHERE true\n  AND (:name::text = ''  OR \"name\" ILIKE '%' || :name || '%')\n  AND (:cpf::text = ''   OR \"cpf\" = :cpf)\n  AND (:phone::text = '' OR \"phone\" = :phone)"};

/**
 * Query generated from SQL:
 * ```
 * SELECT COUNT(id)::int as count
 * FROM "secretaries"
 * WHERE true
 *   AND (:name::text = ''  OR "name" ILIKE '%' || :name || '%')
 *   AND (:cpf::text = ''   OR "cpf" = :cpf)
 *   AND (:phone::text = '' OR "phone" = :phone)
 * ```
 */
export const countSecretaries = new PreparedQuery<ICountSecretariesParams,ICountSecretariesResult>(countSecretariesIR);


/** 'DeleteSecretaryById' parameters type */
export interface IDeleteSecretaryByIdParams {
  secretaryId?: string | null | void;
}

/** 'DeleteSecretaryById' return type */
export type IDeleteSecretaryByIdResult = void;

/** 'DeleteSecretaryById' query type */
export interface IDeleteSecretaryByIdQuery {
  params: IDeleteSecretaryByIdParams;
  result: IDeleteSecretaryByIdResult;
}

const deleteSecretaryByIdIR: any = {"usedParamSet":{"secretaryId":true},"params":[{"name":"secretaryId","required":false,"transform":{"type":"scalar"},"locs":[{"a":39,"b":50}]}],"statement":"DELETE FROM \"secretaries\"\nWHERE \"id\" = :secretaryId"};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM "secretaries"
 * WHERE "id" = :secretaryId
 * ```
 */
export const deleteSecretaryById = new PreparedQuery<IDeleteSecretaryByIdParams,IDeleteSecretaryByIdResult>(deleteSecretaryByIdIR);


