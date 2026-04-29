import { AxiosResponse } from 'axios'

const PATH_UUID_REGEX = /\/(\w\w\w\w\w\w\w\w-\w\w\w\w-\w\w\w\w-\w\w\w\w-\w\w\w\w\w\w\w\w\w\w\w\w)/g
const UUID_REGEX = /^\w\w\w\w\w\w\w\w-\w\w\w\w/

export function redactResponse(response: AxiosResponse | undefined): any {
  function redactData(data: any): any {
    if (typeof data !== 'object') return data
    if (!data) return data
    if (Array.isArray(data)) return data.map(redactData)
    const newData = { ...data }
    if (newData.accessToken) newData.accessToken = '[access-token]'
    if (newData.refreshToken) newData.refreshToken = '[access-token]'
    if (newData.createdAt) newData.createdAt = '[temporal]'
    if (newData.updatedAt) newData.updatedAt = '[temporal]'
    if (newData.id) newData.id = '[uuid]'
    if (newData.traceId) newData.traceId = '[trace-id]'
    for (const key in newData) {
      if (typeof newData[key] === 'string' && newData[key].match(UUID_REGEX)) {
        newData[key] = '[uuid]'
      } else {
        newData[key] = redactData(newData[key])
      }
    }
    return newData
  }
  if (!response || typeof response != 'object') return response
  const { data, config, ...responseRest } = response
  const newResponse: any = { ...responseRest }
  newResponse.config = { ...config, url: config.url ?? '' }
  newResponse.data = redactData(data)
  if (config.data) {
    newResponse.config.data = redactData(JSON.parse(config.data))
  }
  for (const match of newResponse.config.url.matchAll(PATH_UUID_REGEX)) {
    newResponse.config.url = newResponse.config.url.replace(match[1], '[uuid]')
  }
  return newResponse
}
