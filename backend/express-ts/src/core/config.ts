import { spawnSync } from 'node:child_process'
import { assertNotNull, assertStringEnum } from '../lib/assertions'

const config: Record<string, Record<string, string | number | boolean>> = {}

function registerConfig<T extends {}>(name: string, getConfig: () => T): T {
  config[name] = config[name] || getConfig()
  return config[name] as T
}

export function getAppConfig() {
  return registerConfig('app', () => ({
    name: assertNotNull('APPOINTMENTS_NAME', process.env.APPOINTMENTS_NAME),
    environment: assertStringEnum('APPOINTMENTS_ENVIRONMENT', process.env.APPOINTMENTS_ENVIRONMENT, listEnvironments()),
    version: process.env.APPOINTMENTS_VERSION ?? getCurrentHashCommit(),
    port: Number(process.env.APPOINTMENTS_PORT || 3000),
  }))
}

export function getLogConfig() {
  return registerConfig('log', () => ({
    format: assertStringEnum('APPOINTMENTS_LOG_FORMAT', process.env.APPOINTMENTS_LOG_FORMAT, listLogFormat()),
    level: assertStringEnum('APPOINTMENTS_LOG_LEVEL', process.env.APPOINTMENTS_LOG_LEVEL, listLogLevel()),
  }))
}

export function getDatabaseConfig() {
  return registerConfig('database', () => ({
    connectionString: assertNotNull('APPOINTMENTS_DATABASE_URL', process.env.APPOINTMENTS_DATABASE_URL),
    port: assertNotNull('APPOINTMENTS_DATABASE_PORT', process.env.APPOINTMENTS_DATABASE_PORT),
    name: assertNotNull('APPOINTMENTS_DATABASE_NAME', process.env.APPOINTMENTS_DATABASE_NAME),
    user: assertNotNull('APPOINTMENTS_DATABASE_USER', process.env.APPOINTMENTS_DATABASE_USER),
    password: assertNotNull('APPOINTMENTS_DATABASE_PASSWORD', process.env.APPOINTMENTS_DATABASE_PASSWORD),
    host: assertNotNull('APPOINTMENTS_DATABASE_HOST', process.env.APPOINTMENTS_DATABASE_HOST),
  }))
}

export function getJwtConfig() {
  return registerConfig('jwt', () => ({
    secret: assertNotNull('APPOINTMENTS_JWT_SECRET', process.env.APPOINTMENTS_JWT_SECRET),
  }))
}

export function listConfiguredResources() {
  return Object.keys(config)
}

export function listEnvironments() {
  return ['test', 'stagging', 'development', 'production'] as const
}
export function listLogFormat() {
  return ['pretty', 'json', 'datadog'] as const
}
export function listLogLevel() {
  return ['silent', 'trace', 'debug', 'info', 'warn', 'error'] as const
}

function getCurrentHashCommit() {
  const proc = spawnSync('git', ['log', '-n', '1'], { encoding: 'utf-8' })
  const stdout = proc.stdout.toString()
  return stdout.slice(stdout.indexOf(' ') + 1, stdout.indexOf('\n'))
}
