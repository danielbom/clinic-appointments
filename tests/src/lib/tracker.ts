interface ProxyResult<T> {
  proxy: T
  report: () => Record<string, number>
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

export function createTracker<T extends object>(root: string, obj: T): ProxyResult<T> {
  const result: Record<string, number> = {}

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

        return value
      },
    })
  }

  init(obj, root)

  return {
    proxy: wrap(obj, root),
    report: () => result,
  }
}
