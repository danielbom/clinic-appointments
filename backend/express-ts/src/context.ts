import { Request } from 'express'

class Context<T extends Record<any, any>> {
  private contextKey = '_context'

  constructor() {}

  get<K extends keyof T>(req: Request, key: K): T[K] {
    return (req as any)[this.contextKey][key]
  }

  set<K extends keyof T>(req: Request, key: K, value: T[K]) {
    const values = (req as any)[this.contextKey]
    if (!values) (req as any)[this.contextKey] = {}
    ;(req as any)[this.contextKey][key] = value
  }
}

export const context = new Context<{
  id: string
}>()
