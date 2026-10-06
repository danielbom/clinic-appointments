import { db } from '../../core/db'

export type DatabaseInfo = {
  version: string
  max_connections: number
  opened_connections: number
  schema_version: number
}

export async function queryDatabaseInfo({ databaseName }: { databaseName: string }) {
  const rows = await db.$queryRaw<DatabaseInfo[]>`-- name: GetDbSettings :one
SELECT
  current_setting('server_version') as version,
  current_setting('max_connections')::int as max_connections,
  (SELECT count(*)::int FROM pg_stat_activity WHERE datname = ${databaseName}) as opened_connections,
  (SELECT version FROM schema_version) as schema_version;`
  return rows[0] as DatabaseInfo
}

export type DbStatus = {
  status: 'UP' | 'DEGRADED' | 'DOWN'
  latencyMs: number
}

export async function pingDatabase(): Promise<DbStatus> {
  const startTime = Date.now()
  let status: DbStatus['status'] = 'DOWN'
  try {
    await db.$queryRaw`SELECT 1`
    status = 'UP'
  } catch {
    // nop
  }
  const latencyMs = Date.now() - startTime
  status = status === 'UP' && latencyMs > 500 ? 'DEGRADED' : status
  return { status, latencyMs }
}
