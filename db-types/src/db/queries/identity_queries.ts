/** Types generated for queries found in "generated/queries/identity_queries.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'GetIdentityByEmail' parameters type */
export interface IGetIdentityByEmailParams {
  email?: string | null | void;
}

/** 'GetIdentityByEmail' return type */
export interface IGetIdentityByEmailResult {
  email: string | null;
  id: string | null;
  name: string | null;
  password: string | null;
  role: string | null;
}

/** 'GetIdentityByEmail' query type */
export interface IGetIdentityByEmailQuery {
  params: IGetIdentityByEmailParams;
  result: IGetIdentityByEmailResult;
}

const getIdentityByEmailIR: any = {"usedParamSet":{"email":true},"params":[{"name":"email","required":false,"transform":{"type":"scalar"},"locs":[{"a":99,"b":104},{"a":225,"b":230}]}],"statement":"SELECT \"id\", \"name\", \"email\", \"password\", 'admin' as \"role\"\nFROM \"admins\"\nWHERE \"admins\".\"email\" = :email\nUNION\nSELECT \"id\", \"name\", \"email\", \"password\", 'secretary' as \"role\"\nFROM \"secretaries\"\nWHERE \"secretaries\".\"email\" = :email\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT "id", "name", "email", "password", 'admin' as "role"
 * FROM "admins"
 * WHERE "admins"."email" = :email
 * UNION
 * SELECT "id", "name", "email", "password", 'secretary' as "role"
 * FROM "secretaries"
 * WHERE "secretaries"."email" = :email
 * LIMIT 1
 * ```
 */
export const getIdentityByEmail = new PreparedQuery<IGetIdentityByEmailParams,IGetIdentityByEmailResult>(getIdentityByEmailIR);


/** 'GetIdentityById' parameters type */
export interface IGetIdentityByIdParams {
  id?: string | null | void;
}

/** 'GetIdentityById' return type */
export interface IGetIdentityByIdResult {
  email: string | null;
  id: string | null;
  name: string | null;
  password: string | null;
  role: string | null;
}

/** 'GetIdentityById' query type */
export interface IGetIdentityByIdQuery {
  params: IGetIdentityByIdParams;
  result: IGetIdentityByIdResult;
}

const getIdentityByIdIR: any = {"usedParamSet":{"id":true},"params":[{"name":"id","required":false,"transform":{"type":"scalar"},"locs":[{"a":96,"b":98},{"a":216,"b":218}]}],"statement":"SELECT \"id\", \"name\", \"email\", \"password\", 'admin' as \"role\"\nFROM \"admins\"\nWHERE \"admins\".\"id\" = :id\nUNION\nSELECT \"id\", \"name\", \"email\", \"password\", 'secretary' as \"role\"\nFROM \"secretaries\"\nWHERE \"secretaries\".\"id\" = :id\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT "id", "name", "email", "password", 'admin' as "role"
 * FROM "admins"
 * WHERE "admins"."id" = :id
 * UNION
 * SELECT "id", "name", "email", "password", 'secretary' as "role"
 * FROM "secretaries"
 * WHERE "secretaries"."id" = :id
 * LIMIT 1
 * ```
 */
export const getIdentityById = new PreparedQuery<IGetIdentityByIdParams,IGetIdentityByIdResult>(getIdentityByIdIR);


