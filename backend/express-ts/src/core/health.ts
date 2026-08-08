import { getAppConfig, getDatabaseConfig } from './config'
import { checkDatabase } from './db'
import type { InfraStatus } from './infra'
import type * as types from '../http/types'
import * as queries from './queries'

async function getInfraStatus({ withInfo }: { withInfo: boolean }) {
  const database = await checkDatabase()
  if (withInfo && database.status === 'UP') {
    const { name: databaseName } = getDatabaseConfig()
    const info = await queries.queryDatabaseInfo({ databaseName })
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

export function healthLiveness(): types.schemas.HealthLiveness {
  const timestamp = new Date().toISOString()
  const { environment } = getAppConfig()
  return { status: 'UP', environment, timestamp }
}

export async function healthReadiness(): Promise<types.schemas.HealthReadiness> {
  const timestamp = new Date().toISOString()
  const { environment } = getAppConfig()

  const { required, optional } = await getInfraStatus({ withInfo: false })
  const details = { ...required, ...optional }
  const requiredValues = Object.values(required)

  const hasAnyRequiredDown = requiredValues.find((it) => it.status === 'DOWN')
  const status = hasAnyRequiredDown ? 'DOWN' : 'UP'

  return { status, environment, timestamp, details }
}
