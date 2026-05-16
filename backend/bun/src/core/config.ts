import { assertNotNull, assertStringEnum } from '../lib/assertions'

const config: Record<string, Record<string, string | number | boolean>> = {}

function registerConfig<T extends {}>(name: string, getConfig: () => T): T {
  config[name] = config[name] || getConfig()
  return config[name] as T
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

export function getAppConfig() {
  return registerConfig('app', () => ({
    name: assertNotNull('APPOINTMENTS_NAME', process.env.APPOINTMENTS_NAME),
    environment: assertStringEnum('APPOINTMENTS_ENVIRONMENT', process.env.APPOINTMENTS_ENVIRONMENT, [
      'test',
      'development',
      'production',
    ]),
    port: Number(process.env.APPOINTMENTS_PORT || 3000),
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
