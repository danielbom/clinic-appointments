import { AxiosResponse } from 'axios'
import { Writable } from '../../../src/lib/writable'

export function writeResponse(writer: Writable, response: AxiosResponse) {
  // https://github.com/horprogs/react-query/blob/7e69a716054958721288d34a26b30427c257aa3b/src/utils/mockApi.ts#L37
  if (!response) return
  const method = response.config.method?.toUpperCase() || 'UNKNOWN'
  const url = response.config.url
  if (!url) return
  const status = response.status
  writer.write(`Request: ${method} ${url} ${status}\n`)
  if (response.config.params != null) {
    writer.write(`Params: ${JSON.stringify(response.config.params, null, 2)}\n`)
  }
  if (response.config.data != null) {
    writer.write(`Body: ${JSON.stringify(response.config.data, null, 2)}\n`)
  }
  if (response.data != null) {
    writer.write(`Response: ${JSON.stringify(response.data, null, 2)}\n`)
  }
  writer.write('\n')
}
