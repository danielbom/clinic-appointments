/** Types generated for queries found in "generated/queries/specialist_hours_queries.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type DateOrString = Date | string;

/** 'CreateSpecialistHour' parameters type */
export interface ICreateSpecialistHourParams {
  endTime?: DateOrString | null | void;
  specialistId?: string | null | void;
  startTime?: DateOrString | null | void;
  weekday?: number | null | void;
}

/** 'CreateSpecialistHour' return type */
export interface ICreateSpecialistHourResult {
  id: string;
}

/** 'CreateSpecialistHour' query type */
export interface ICreateSpecialistHourQuery {
  params: ICreateSpecialistHourParams;
  result: ICreateSpecialistHourResult;
}

const createSpecialistHourIR: any = {"usedParamSet":{"specialistId":true,"weekday":true,"startTime":true,"endTime":true},"params":[{"name":"specialistId","required":false,"transform":{"type":"scalar"},"locs":[{"a":93,"b":105}]},{"name":"weekday","required":false,"transform":{"type":"scalar"},"locs":[{"a":116,"b":123}]},{"name":"startTime","required":false,"transform":{"type":"scalar"},"locs":[{"a":134,"b":143}]},{"name":"endTime","required":false,"transform":{"type":"scalar"},"locs":[{"a":154,"b":161}]}],"statement":"INSERT INTO specialist_hours (\"specialist_id\", \"weekday\", \"start_time\", \"end_time\")\nVALUES ( :specialistId\n       , :weekday\n       , :startTime\n       , :endTime\n       )\nRETURNING \"id\""};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO specialist_hours ("specialist_id", "weekday", "start_time", "end_time")
 * VALUES ( :specialistId
 *        , :weekday
 *        , :startTime
 *        , :endTime
 *        )
 * RETURNING "id"
 * ```
 */
export const createSpecialistHour = new PreparedQuery<ICreateSpecialistHourParams,ICreateSpecialistHourResult>(createSpecialistHourIR);


/** 'ListSpecialistHoursIntersecting' parameters type */
export interface IListSpecialistHoursIntersectingParams {
  endTime?: DateOrString | null | void;
  specialistId?: string | null | void;
  startTime?: DateOrString | null | void;
  weekday?: number | null | void;
}

/** 'ListSpecialistHoursIntersecting' return type */
export interface IListSpecialistHoursIntersectingResult {
  end_time: Date;
  id: string;
  specialist_id: string;
  start_time: Date;
  weekday: number;
}

/** 'ListSpecialistHoursIntersecting' query type */
export interface IListSpecialistHoursIntersectingQuery {
  params: IListSpecialistHoursIntersectingParams;
  result: IListSpecialistHoursIntersectingResult;
}

const listSpecialistHoursIntersectingIR: any = {"usedParamSet":{"specialistId":true,"weekday":true,"startTime":true,"endTime":true},"params":[{"name":"specialistId","required":false,"transform":{"type":"scalar"},"locs":[{"a":112,"b":124}]},{"name":"weekday","required":false,"transform":{"type":"scalar"},"locs":[{"a":146,"b":153}]},{"name":"startTime","required":false,"transform":{"type":"scalar"},"locs":[{"a":173,"b":182}]},{"name":"endTime","required":false,"transform":{"type":"scalar"},"locs":[{"a":246,"b":253}]}],"statement":"SELECT \"id\", \"specialist_id\", \"weekday\", \"start_time\", \"end_time\"\nFROM specialist_hours\nWHERE \"specialist_id\" = :specialistId\n    AND \"weekday\" = :weekday\n    AND (\n        :startTime::time BETWEEN \"start_time\" AND \"end_time\"\n        OR \n        :endTime::time BETWEEN \"start_time\" AND \"end_time\"\n    )\nORDER BY \"start_time\" ASC"};

/**
 * Query generated from SQL:
 * ```
 * SELECT "id", "specialist_id", "weekday", "start_time", "end_time"
 * FROM specialist_hours
 * WHERE "specialist_id" = :specialistId
 *     AND "weekday" = :weekday
 *     AND (
 *         :startTime::time BETWEEN "start_time" AND "end_time"
 *         OR 
 *         :endTime::time BETWEEN "start_time" AND "end_time"
 *     )
 * ORDER BY "start_time" ASC
 * ```
 */
export const listSpecialistHoursIntersecting = new PreparedQuery<IListSpecialistHoursIntersectingParams,IListSpecialistHoursIntersectingResult>(listSpecialistHoursIntersectingIR);


/** 'UpdateSpecialistHourStartAndEndTime' parameters type */
export interface IUpdateSpecialistHourStartAndEndTimeParams {
  endTime?: DateOrString | null | void;
  specialistHoursId?: string | null | void;
  startTime?: DateOrString | null | void;
}

/** 'UpdateSpecialistHourStartAndEndTime' return type */
export type IUpdateSpecialistHourStartAndEndTimeResult = void;

/** 'UpdateSpecialistHourStartAndEndTime' query type */
export interface IUpdateSpecialistHourStartAndEndTimeQuery {
  params: IUpdateSpecialistHourStartAndEndTimeParams;
  result: IUpdateSpecialistHourStartAndEndTimeResult;
}

const updateSpecialistHourStartAndEndTimeIR: any = {"usedParamSet":{"startTime":true,"endTime":true,"specialistHoursId":true},"params":[{"name":"startTime","required":false,"transform":{"type":"scalar"},"locs":[{"a":43,"b":52}]},{"name":"endTime","required":false,"transform":{"type":"scalar"},"locs":[{"a":79,"b":86}]},{"name":"specialistHoursId","required":false,"transform":{"type":"scalar"},"locs":[{"a":107,"b":124}]}],"statement":"UPDATE specialist_hours\nSET \"start_time\" = :startTime::time\n  , \"end_time\"   = :endTime::time\nWHERE \"id\" = :specialistHoursId"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE specialist_hours
 * SET "start_time" = :startTime::time
 *   , "end_time"   = :endTime::time
 * WHERE "id" = :specialistHoursId
 * ```
 */
export const updateSpecialistHourStartAndEndTime = new PreparedQuery<IUpdateSpecialistHourStartAndEndTimeParams,IUpdateSpecialistHourStartAndEndTimeResult>(updateSpecialistHourStartAndEndTimeIR);


