import 'dotenv/config'

function assertNotNull<T>(name: string, a: T | undefined | null): T {
  if (a === undefined) throw new Error(`'${name}' is undefined`)
  if (a === null) throw new Error(`'${name}' is null`)
  return a
}

const DEBUG_CLAIMS = process.env.DEBUG_CLAIMS === 'true'
const LOG_RESPONSE = process.env.LOG_RESPONSE === 'true'
const LOG_BODY = process.env.LOG_BODY === 'true'
const API_URL = assertNotNull('API_URL', process.env.API_URL)

export { DEBUG_CLAIMS, LOG_BODY, LOG_RESPONSE, API_URL }
