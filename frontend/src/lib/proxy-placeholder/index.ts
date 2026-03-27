export function proxyPlaceholder<T>(): T {
  const proxy = new Proxy(function f() {}, {
    get(target, property, receiver) {
      if (!Reflect.has(target, property)) {
        Reflect.set(target, property, proxy, receiver)
      }
      return Reflect.get(target, property, receiver)
    },
  })
  return proxy as T
}
