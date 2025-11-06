/** Types generated for queries found in "generated/queries/admin_queries.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'CreateAdmin' parameters type */
export interface ICreateAdminParams {
  email?: string | null | void;
  name?: string | null | void;
  password?: string | null | void;
}

/** 'CreateAdmin' return type */
export interface ICreateAdminResult {
  id: string;
}

/** 'CreateAdmin' query type */
export interface ICreateAdminQuery {
  params: ICreateAdminParams;
  result: ICreateAdminResult;
}

const createAdminIR: any = {"usedParamSet":{"name":true,"email":true,"password":true},"params":[{"name":"name","required":false,"transform":{"type":"scalar"},"locs":[{"a":60,"b":64}]},{"name":"email","required":false,"transform":{"type":"scalar"},"locs":[{"a":75,"b":80}]},{"name":"password","required":false,"transform":{"type":"scalar"},"locs":[{"a":91,"b":99}]}],"statement":"INSERT INTO \"admins\" (\"name\", \"email\", \"password\")\nVALUES ( :name\n       , :email\n       , :password\n       )\nRETURNING \"id\""};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO "admins" ("name", "email", "password")
 * VALUES ( :name
 *        , :email
 *        , :password
 *        )
 * RETURNING "id"
 * ```
 */
export const createAdmin = new PreparedQuery<ICreateAdminParams,ICreateAdminResult>(createAdminIR);


