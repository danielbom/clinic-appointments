function remove(storage: Storage, key: string) {
  storage.removeItem(key)
}

function set(storage: Storage, key: string, value: any) {
  storage.setItem(key, JSON.stringify(value))
}

function get<T>(storage: Storage, key: string, defaultValue: T): T {
  const item = storage.getItem(key)
  return item ? JSON.parse(item) : defaultValue
}

// localStorage
export const removeLocalStorage = (key: string) => remove(localStorage, key)
export const setLocalStorage = (key: string, value: any) => set(localStorage, key, value)
export const getLocalStorage = <T>(key: string, defaultValue: T) => get(localStorage, key, defaultValue)

// sessionStorage
export const removeSessionStorage = (key: string) => remove(sessionStorage, key)
export const setSessionStorage = (key: string, value: any) => set(sessionStorage, key, value)
export const getSessionStorage = <T>(key: string, defaultValue: T) => get(sessionStorage, key, defaultValue)
