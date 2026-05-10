interface ProxyResult<T> {
  proxy: T
  report: () => Record<string, number>
  timing: () => Record<string, { min: number; max: number; avg: number; total: number }>
}

function getAllMethodNames(obj: object): string[] {
  const methods: string[] = []
  let proto = Object.getPrototypeOf(obj)

  while (proto && proto !== Object.prototype) {
    const names = Object.getOwnPropertyNames(proto).filter((name) => {
      const descriptor = Object.getOwnPropertyDescriptor(proto, name)
      return typeof descriptor?.value === 'function' && name !== 'constructor'
    })
    methods.push(...names)
    proto = Object.getPrototypeOf(proto)
  }

  return Array.from(new Set(methods)) // Remove duplicates
}

class Timing {
  constructor(
    public min: number,
    public max: number,
    public total: number,
    public count: number,
  ) {}

  static of(time: number) {
    return new Timing(time, time, time, 1)
  }

  append(other: Timing): Timing {
    return new Timing(
      Math.min(this.min, other.min),
      Math.max(this.max, other.max),
      this.total + other.total,
      this.count + other.count,
    )
  }
}

export function createTracker<T extends object>(root: string, obj: T): ProxyResult<T> {
  const result: Record<string, number> = {}
  const timing: Record<string, Timing> = {}

  function init(node: any, path: string) {
    for (const prop of Object.keys(node).concat(getAllMethodNames(node))) {
      if (prop === '_config') {
        continue
      }
      const key = `${path}.${prop}`
      if (typeof node[prop] === 'function') {
        result[key] = 0
      } else {
        init(node[prop], key)
      }
    }
  }

  function wrap(node: any, path: string) {
    return new Proxy(node, {
      get(target, prop, receiver) {
        const value = Reflect.get(target, prop, receiver)
        if (typeof prop === 'symbol') {
          return value
        }

        const key = `${path}.${prop}`
        const count = result[key]
        if (count !== undefined) {
          result[key] = count + 1
        }

        if (value && typeof value === 'object') {
          return wrap(value, key)
        }

        if (typeof value === 'function') {
          async function timeit(...args: any[]) {
            const startTime = Date.now()
            const result = await (value as Function).call(target, ...args)
            if (result && typeof result === 'object' && typeof result.status === 'number' && result.status < 300) {
              const endTime = Date.now()
              const time = Timing.of(endTime - startTime)
              if (!timing[key]) {
                timing[key] = time
              } else {
                timing[key] = timing[key].append(time)
              }
            }
            return result
          }
          return timeit
        }

        return value
      },
    })
  }

  init(obj, root)

  return {
    proxy: wrap(obj, root),
    report: () => result,
    timing: () =>
      Object.fromEntries(
        Object.entries(timing).map(([key, timing]) => [
          key,
          {
            min: timing.min,
            max: timing.max,
            avg: Number((timing.total / timing.count).toFixed(2)),
            total: timing.total,
            count: timing.count,
          },
        ]),
      ),
  }
}
