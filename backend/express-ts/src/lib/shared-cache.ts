type RawData = number | string | boolean | { [key: string]: RawData } | RawData[]

export class SharedCache {
  get<T extends RawData>(_key: string): T | undefined {
    throw new Error('not implemented')
  }

  set(_key: string, _data: RawData) {
    throw new Error('not implemented')
  }
}
