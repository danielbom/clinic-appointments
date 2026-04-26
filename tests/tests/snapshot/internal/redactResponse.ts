import { AxiosResponse } from 'axios'

const ids = {
  items: {} as Record<string, number>,
  current: 1,
  get(id: string) {
    ids.items[id] = ids.items[id] || this.current++
    return ids.items[id]
  },
}

const UUID_REGEX = /\/(\w\w\w\w\w\w\w\w-\w\w\w\w-\w\w\w\w-\w\w\w\w-\w\w\w\w\w\w\w\w\w\w\w\w)/g

export function redactResponse(response: AxiosResponse | undefined): any {
  function redactData(data: any): any {
    if (typeof data !== 'object') return data
    if (!data) return data
    if (Array.isArray(data)) return data.map(redactData)
    const newData = { ...data }
    if (newData.accessToken) newData.accessToken = ids.get(newData.accessToken)
    if (newData.refreshToken) newData.refreshToken = ids.get(newData.refreshToken)
    if (newData.createdAt) newData.createdAt = '[temporal]'
    if (newData.updatedAt) newData.updatedAt = '[temporal]'
    if (newData.id) newData.id = ids.get(newData.id)
    for (const key in newData) {
      if (key.endsWith('Id')) {
        newData[key] = ids.get(newData[key])
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
  for (const match of newResponse.config.url.matchAll(UUID_REGEX)) {
    newResponse.config.url = newResponse.config.url.replace(match[1], ids.get(match[1]).toString())
  }
  return newResponse
}
