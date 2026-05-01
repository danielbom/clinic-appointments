import { AxiosInstance } from 'axios'
import { writeResponse } from './writeResponse'
import { redactResponse } from './redactResponse'
import { findInStack } from './findInStack'
import { SimpleAxiosError } from './SimpleAxiosError'
import { WriteStdout } from '../../../src/lib/writable'

let writeResponses = true
let count = 0

export function plugInterceptors(
  fileName: string,
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
      const location = findInStack([fileName, 'async run']) + '\n'
      if (writeResponses) {
        writter.write(location)
        writeResponse(writter, redactResponse(response))
      }
      const startTime = (response.config as any).metadata.startTime
      const ms = (endTime - startTime).toFixed(3)
      logger.write(`[${new Date().toISOString()}] ${count++} request [${ms} ms]\n`)
      logger.write(location)
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
