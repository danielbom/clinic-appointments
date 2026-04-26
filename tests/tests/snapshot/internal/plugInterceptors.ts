import { AxiosInstance } from 'axios'
import { writeResponse } from './writeResponse'
import { redactResponse } from './redactResponse'
import { findInStack } from './findInStack'
import { SimpleAxiosError } from './SimpleAxiosError'
import { WriteStdout } from '../../../src/lib/writable'

let writeResponses = true
let count = 0

export function plugInterceptors(
  axiosInstance: AxiosInstance,
  {
    writter = new WriteStdout(), //
    logger = new WriteStdout(), //
  },
) {
  axiosInstance.interceptors.request.use((config) => {
    ;(config as any).metadata = { startTime: performance.now() }
    return config
  })

  axiosInstance.interceptors.response.use(
    (response) => {
      const endTime = performance.now()
      if (writeResponses) writeResponse(writter, redactResponse(response))
      const startTime = (response.config as any).metadata.startTime
      const ms = (endTime - startTime).toFixed(3)
      logger.write(`[${new Date().toISOString()}] ${count++} request [${ms} ms]\n`)
      logger.write(findInStack(['api.ts', 'async run']) + '\n')
      logger.write(findInStack(['endpoints', 'Endpoint.ts']) + '\n')
      return response
    },
    (error) => {
      if (writeResponses) writeResponse(writter, redactResponse(error.response))
      return Promise.reject(new SimpleAxiosError(error))
    },
  )
}

export function enableWriteResponse(value: boolean) {
  writeResponses = value
}
