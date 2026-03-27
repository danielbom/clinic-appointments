/** Types generated for queries found in "generated/queries/customers_queries.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'CreateCustomer' parameters type */
export interface ICreateCustomerParams {
  birthdate?: string | null | void;
  cpf?: string | null | void;
  email?: string | null | void;
  name?: string | null | void;
  phone?: string | null | void;
}

/** 'CreateCustomer' return type */
export interface ICreateCustomerResult {
  birthdate: string;
  cpf: string;
  email: string | null;
  id: string;
  name: string;
  phone: string;
}

/** 'CreateCustomer' query type */
export interface ICreateCustomerQuery {
  params: ICreateCustomerParams;
  result: ICreateCustomerResult;
}

const createCustomerIR: any = {"usedParamSet":{"name":true,"email":true,"phone":true,"birthdate":true,"cpf":true},"params":[{"name":"name","required":false,"transform":{"type":"scalar"},"locs":[{"a":80,"b":84}]},{"name":"email","required":false,"transform":{"type":"scalar"},"locs":[{"a":95,"b":100}]},{"name":"phone","required":false,"transform":{"type":"scalar"},"locs":[{"a":111,"b":116}]},{"name":"birthdate","required":false,"transform":{"type":"scalar"},"locs":[{"a":127,"b":136}]},{"name":"cpf","required":false,"transform":{"type":"scalar"},"locs":[{"a":147,"b":150}]}],"statement":"INSERT INTO \"customers\" (\"name\", \"email\", \"phone\", \"birthdate\", \"cpf\")\nVALUES ( :name\n       , :email\n       , :phone\n       , :birthdate\n       , :cpf\n       )\nRETURNING \"id\", \"name\", \"email\", \"phone\", \"birthdate\", \"cpf\""};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO "customers" ("name", "email", "phone", "birthdate", "cpf")
 * VALUES ( :name
 *        , :email
 *        , :phone
 *        , :birthdate
 *        , :cpf
 *        )
 * RETURNING "id", "name", "email", "phone", "birthdate", "cpf"
 * ```
 */
export const createCustomer = new PreparedQuery<ICreateCustomerParams,ICreateCustomerResult>(createCustomerIR);


/** 'UpdateCustomer' parameters type */
export interface IUpdateCustomerParams {
  birthdate?: string | null | void;
  cpf?: string | null | void;
  email?: string | null | void;
  id?: string | null | void;
  name?: string | null | void;
  phone?: string | null | void;
}

/** 'UpdateCustomer' return type */
export interface IUpdateCustomerResult {
  birthdate: string;
  cpf: string;
  email: string | null;
  id: string;
  name: string;
  phone: string;
}

/** 'UpdateCustomer' query type */
export interface IUpdateCustomerQuery {
  params: IUpdateCustomerParams;
  result: IUpdateCustomerResult;
}

const updateCustomerIR: any = {"usedParamSet":{"name":true,"email":true,"phone":true,"birthdate":true,"cpf":true,"id":true},"params":[{"name":"name","required":false,"transform":{"type":"scalar"},"locs":[{"a":39,"b":43}]},{"name":"email","required":false,"transform":{"type":"scalar"},"locs":[{"a":62,"b":67}]},{"name":"phone","required":false,"transform":{"type":"scalar"},"locs":[{"a":86,"b":91}]},{"name":"birthdate","required":false,"transform":{"type":"scalar"},"locs":[{"a":110,"b":119}]},{"name":"cpf","required":false,"transform":{"type":"scalar"},"locs":[{"a":138,"b":141}]},{"name":"id","required":false,"transform":{"type":"scalar"},"locs":[{"a":156,"b":158}]}],"statement":"UPDATE \"customers\"\nSET\n  \"name\"      = :name,\n  \"email\"     = :email,\n  \"phone\"     = :phone,\n  \"birthdate\" = :birthdate,\n  \"cpf\"       = :cpf\nWHERE \"id\" = :id\nRETURNING \"id\", \"name\", \"email\", \"phone\", \"birthdate\", \"cpf\""};

/**
 * Query generated from SQL:
 * ```
 * UPDATE "customers"
 * SET
 *   "name"      = :name,
 *   "email"     = :email,
 *   "phone"     = :phone,
 *   "birthdate" = :birthdate,
 *   "cpf"       = :cpf
 * WHERE "id" = :id
 * RETURNING "id", "name", "email", "phone", "birthdate", "cpf"
 * ```
 */
export const updateCustomer = new PreparedQuery<IUpdateCustomerParams,IUpdateCustomerResult>(updateCustomerIR);


/** 'GetCustomerById' parameters type */
export interface IGetCustomerByIdParams {
  customerId?: string | null | void;
}

/** 'GetCustomerById' return type */
export interface IGetCustomerByIdResult {
  birthdate: string;
  cpf: string;
  email: string | null;
  id: string;
  name: string;
  phone: string;
}

/** 'GetCustomerById' query type */
export interface IGetCustomerByIdQuery {
  params: IGetCustomerByIdParams;
  result: IGetCustomerByIdResult;
}

const getCustomerByIdIR: any = {"usedParamSet":{"customerId":true},"params":[{"name":"customerId","required":false,"transform":{"type":"scalar"},"locs":[{"a":88,"b":98}]}],"statement":"SELECT \"id\", \"name\", \"email\", \"phone\", \"birthdate\", \"cpf\"\nFROM \"customers\"\nWHERE \"id\" = :customerId\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT "id", "name", "email", "phone", "birthdate", "cpf"
 * FROM "customers"
 * WHERE "id" = :customerId
 * LIMIT 1
 * ```
 */
export const getCustomerById = new PreparedQuery<IGetCustomerByIdParams,IGetCustomerByIdResult>(getCustomerByIdIR);


/** 'GetCustomerByPhone' parameters type */
export interface IGetCustomerByPhoneParams {
  customerPhone?: string | null | void;
}

/** 'GetCustomerByPhone' return type */
export interface IGetCustomerByPhoneResult {
  birthdate: string;
  cpf: string;
  email: string | null;
  id: string;
  name: string;
  phone: string;
}

/** 'GetCustomerByPhone' query type */
export interface IGetCustomerByPhoneQuery {
  params: IGetCustomerByPhoneParams;
  result: IGetCustomerByPhoneResult;
}

const getCustomerByPhoneIR: any = {"usedParamSet":{"customerPhone":true},"params":[{"name":"customerPhone","required":false,"transform":{"type":"scalar"},"locs":[{"a":91,"b":104}]}],"statement":"SELECT \"id\", \"name\", \"email\", \"phone\", \"birthdate\", \"cpf\"\nFROM \"customers\"\nWHERE \"phone\" = :customerPhone\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT "id", "name", "email", "phone", "birthdate", "cpf"
 * FROM "customers"
 * WHERE "phone" = :customerPhone
 * LIMIT 1
 * ```
 */
export const getCustomerByPhone = new PreparedQuery<IGetCustomerByPhoneParams,IGetCustomerByPhoneResult>(getCustomerByPhoneIR);


/** 'ListCustomers' parameters type */
export interface IListCustomersParams {
  cpf?: string | null | void;
  limit?: number | null | void;
  name?: string | null | void;
  offset?: number | null | void;
  phone?: string | null | void;
}

/** 'ListCustomers' return type */
export interface IListCustomersResult {
  birthdate: string;
  cpf: string;
  email: string | null;
  id: string;
  name: string;
  phone: string;
}

/** 'ListCustomers' query type */
export interface IListCustomersQuery {
  params: IListCustomersParams;
  result: IListCustomersResult;
}

const listCustomersIR: any = {"usedParamSet":{"name":true,"cpf":true,"phone":true,"limit":true,"offset":true},"params":[{"name":"name","required":false,"transform":{"type":"scalar"},"locs":[{"a":93,"b":97},{"a":134,"b":138}]},{"name":"cpf","required":false,"transform":{"type":"scalar"},"locs":[{"a":155,"b":158},{"a":184,"b":187}]},{"name":"phone","required":false,"transform":{"type":"scalar"},"locs":[{"a":197,"b":202},{"a":228,"b":233}]},{"name":"limit","required":false,"transform":{"type":"scalar"},"locs":[{"a":242,"b":247}]},{"name":"offset","required":false,"transform":{"type":"scalar"},"locs":[{"a":265,"b":271}]}],"statement":"SELECT \"id\", \"name\", \"email\", \"phone\", \"birthdate\", \"cpf\"\nFROM \"customers\"\nWHERE true\n  AND (:name::text = ''  OR \"name\" ILIKE '%' || :name || '%')\n  AND (:cpf::text = ''   OR \"cpf\" = :cpf)\n  AND (:phone::text = '' OR \"phone\" = :phone)\nLIMIT :limit::integer\nOFFSET :offset::integer"};

/**
 * Query generated from SQL:
 * ```
 * SELECT "id", "name", "email", "phone", "birthdate", "cpf"
 * FROM "customers"
 * WHERE true
 *   AND (:name::text = ''  OR "name" ILIKE '%' || :name || '%')
 *   AND (:cpf::text = ''   OR "cpf" = :cpf)
 *   AND (:phone::text = '' OR "phone" = :phone)
 * LIMIT :limit::integer
 * OFFSET :offset::integer
 * ```
 */
export const listCustomers = new PreparedQuery<IListCustomersParams,IListCustomersResult>(listCustomersIR);


/** 'CountCustomers' parameters type */
export interface ICountCustomersParams {
  cpf?: string | null | void;
  name?: string | null | void;
  phone?: string | null | void;
}

/** 'CountCustomers' return type */
export interface ICountCustomersResult {
  count: number | null;
}

/** 'CountCustomers' query type */
export interface ICountCustomersQuery {
  params: ICountCustomersParams;
  result: ICountCustomersResult;
}

const countCustomersIR: any = {"usedParamSet":{"name":true,"cpf":true,"phone":true},"params":[{"name":"name","required":false,"transform":{"type":"scalar"},"locs":[{"a":66,"b":70},{"a":107,"b":111}]},{"name":"cpf","required":false,"transform":{"type":"scalar"},"locs":[{"a":128,"b":131},{"a":157,"b":160}]},{"name":"phone","required":false,"transform":{"type":"scalar"},"locs":[{"a":170,"b":175},{"a":201,"b":206}]}],"statement":"SELECT COUNT(id)::int as count\nFROM \"customers\"\nWHERE true\n  AND (:name::text = ''  OR \"name\" ILIKE '%' || :name || '%')\n  AND (:cpf::text = ''   OR \"cpf\" = :cpf)\n  AND (:phone::text = '' OR \"phone\" = :phone)"};

/**
 * Query generated from SQL:
 * ```
 * SELECT COUNT(id)::int as count
 * FROM "customers"
 * WHERE true
 *   AND (:name::text = ''  OR "name" ILIKE '%' || :name || '%')
 *   AND (:cpf::text = ''   OR "cpf" = :cpf)
 *   AND (:phone::text = '' OR "phone" = :phone)
 * ```
 */
export const countCustomers = new PreparedQuery<ICountCustomersParams,ICountCustomersResult>(countCustomersIR);


/** 'DeleteCustomerById' parameters type */
export interface IDeleteCustomerByIdParams {
  customerId?: string | null | void;
}

/** 'DeleteCustomerById' return type */
export type IDeleteCustomerByIdResult = void;

/** 'DeleteCustomerById' query type */
export interface IDeleteCustomerByIdQuery {
  params: IDeleteCustomerByIdParams;
  result: IDeleteCustomerByIdResult;
}

const deleteCustomerByIdIR: any = {"usedParamSet":{"customerId":true},"params":[{"name":"customerId","required":false,"transform":{"type":"scalar"},"locs":[{"a":37,"b":47}]}],"statement":"DELETE FROM \"customers\"\nWHERE \"id\" = :customerId"};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM "customers"
 * WHERE "id" = :customerId
 * ```
 */
export const deleteCustomerById = new PreparedQuery<IDeleteCustomerByIdParams,IDeleteCustomerByIdResult>(deleteCustomerByIdIR);


