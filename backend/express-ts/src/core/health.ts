import { getAppConfig, getDatabaseConfig } from './config'
import { pingDatabase } from './db'
import type { InfraStatus } from './infra'
import type * as types from '../http/types'
import * as queries from '../domain/queries'
import { localCache } from './cache'

async function callPingDatabase() {
  return localCache.getOrLoad({
    key: 'health.check:database.ping',
    ttl: 5 * 1000,
    timeout: 1000,
    staleTtl: 20 * 1000,
    task: () => pingDatabase(),
  })
}

async function callQueryDatabaseInfo({ databaseName }: { databaseName: string }) {
  // NOTE: If databaseName can change, use key: `health.check:database.info:${databaseName}`
  return localCache.getOrLoad({
    key: 'health.check:database.info',
    ttl: 5 * 1000,
    timeout: 1000,
    staleTtl: 20 * 1000,
    task: () => queries.queryDatabaseInfo({ databaseName }),
  })
}

async function getInfraStatus({ withInfo }: { withInfo: boolean }) {
  const database = Object.assign({}, await callPingDatabase())
  if (withInfo && database.status === 'UP') {
    const { name: databaseName } = getDatabaseConfig()
    const info = await callQueryDatabaseInfo({ databaseName })
    database.version = info.version
    database.maxConnections = info.max_connections
    database.openedConnections = info.opened_connections
    database.schemaVersion = info.schema_version
  }
  const required = { database }
  const optional = {} as { [key: string]: InfraStatus }
  return { required, optional }
}

export async function healthCheck(): Promise<types.schemas.HealthCheck> {
  const timestamp = new Date().toISOString()
  const { environment } = getAppConfig()

  const { required, optional } = await getInfraStatus({ withInfo: true })
  const details = { ...required, ...optional }
  const requiredValues = Object.values(required)
  const optionalValues = Object.values(optional)

  const hasAnyRequiredDown = requiredValues.find((it) => it.status === 'DOWN')
  const hasAnyOptionalDown = optionalValues.find((it) => it.status === 'DOWN')
  const hasAnyRequiredDegraded = requiredValues.find((it) => it.status === 'DEGRADED')
  const status = hasAnyRequiredDown ? 'DOWN' : hasAnyOptionalDown || hasAnyRequiredDegraded ? 'DEGRADED' : 'UP'

  return { status, environment, timestamp, details }
}

export function isAlive(): types.schemas.HealthLiveness {
  const timestamp = new Date().toISOString()
  const { environment } = getAppConfig()
  return { status: 'UP', environment, timestamp }
}

export async function isReady(): Promise<types.schemas.HealthCheck> {
  const timestamp = new Date().toISOString()
  const { environment } = getAppConfig()

  const { required, optional } = await getInfraStatus({ withInfo: false })
  const details = { ...required, ...optional }
  const requiredValues = Object.values(required)

  const hasAnyRequiredDown = requiredValues.find((it) => it.status === 'DOWN')
  const status = hasAnyRequiredDown ? 'DOWN' : 'UP'

  return { status, environment, timestamp, details }
}
