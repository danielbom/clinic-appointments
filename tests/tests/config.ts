import dotenv from 'dotenv'

dotenv.config({ quiet: true })

const DEBUG_CLAIMS = process.env.DEBUG_CLAIMS === 'true'
const LOG_RESPONSE = process.env.LOG_RESPONSE === 'true'
const LOG_BODY = process.env.LOG_BODY === 'true'
const BASE_URL = 'http://localhost:8080'

export { DEBUG_CLAIMS, LOG_BODY, LOG_RESPONSE, BASE_URL }
