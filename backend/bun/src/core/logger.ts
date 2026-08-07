import { pino } from 'pino'

import { getAppConfig, getLogConfig } from './config'

function buildLogger() {
  const app = getAppConfig()
  const log = getLogConfig()

  switch (log.format) {
    case 'pretty': {
      return pino({
        level: log.level,
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss',
            ignore: 'pid,hostname',
          },
        },
      })
    }
    case 'datadog': {
      return pino({
        level: log.level,
        messageKey: 'message',
        formatters: { level: (label) => ({ level: label, status: label }) },
        base: {
          'dd.service': (process.env.DD_SERVICE || app.name).replaceAll(' ', ''),
          'dd.env': process.env.DD_ENV || app.environment,
          'dd.version': process.env.DD_VERSION || app.version,
        },
      })
    }
    case 'json': {
      return pino({
        level: log.level,
      })
    }
  }
  throw new Error(`format unimplement: ${log.format}`)
}

export const logger = buildLogger()

export function requestLogger(traceId: string, operationId?: string) {
  return logger.child({ traceId, operationId })
}
