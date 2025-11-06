import type { ColumnType } from 'kysely'

export type SelectType<T> = T extends ColumnType<infer S, any, any> ? S : T

export type SelectResult<T> = {
  [k in keyof T]: SelectType<T[k]>
}
