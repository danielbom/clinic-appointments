type SimplifyApi<Api> = {
  [K1 in keyof Api]: {
    [K2 in keyof Api[K1]]: ''
  }
}

type DotPathsRec<T, Prefix extends string = ''> = {
  [K in keyof T]: T[K] extends object
    ? DotPathsRec<T[K], `${Prefix}${Extract<K, string>}.`>
    : `${Prefix}${Extract<K, string>}`
}[keyof T]

export type DotPaths<T> = DotPathsRec<SimplifyApi<T>>
