import { useCallback, useEffect, useSyncExternalStore } from 'react'

function dispatchStorageEvent(key: string, newValue: any) {
  window.dispatchEvent(new StorageEvent('storage', { key, newValue }))
}

const setSessionStorageItem = (key: string, value: any) => {
  const stringifiedValue = JSON.stringify(value)
  window.sessionStorage.setItem(key, stringifiedValue)
  dispatchStorageEvent(key, stringifiedValue)
}

const removeSessionStorageItem = (key: string) => {
  window.sessionStorage.removeItem(key)
  dispatchStorageEvent(key, null)
}

const getSessionStorageItem = (key: string) => {
  return window.sessionStorage.getItem(key)
}

const useSessionStorageSubscribe = (callback: (...args: any) => void) => {
  window.addEventListener('storage', callback)
  return () => window.removeEventListener('storage', callback)
}

const getSessionStorageServerSnapshot = () => {
  throw Error('useSessionStorage is a client-only hook')
}

// https://github.com/uidotdev/usehooks/blob/main/index.js#L1177
export function useSessionStorage<T extends {}>(key: string, initialValue?: T) {
  const getSnapshot = () => getSessionStorageItem(key)

  const store = useSyncExternalStore(useSessionStorageSubscribe, getSnapshot, getSessionStorageServerSnapshot)

  const setState = useCallback(
    (v: any) => {
      try {
        const nextState = typeof v === 'function' && store ? v(JSON.parse(store)) : v

        if (nextState === undefined || nextState === null) {
          removeSessionStorageItem(key)
        } else {
          setSessionStorageItem(key, nextState)
        }
      } catch (e) {
        console.warn(e)
      }
    },
    [key, store],
  )

  useEffect(() => {
    if (getSessionStorageItem(key) === null && typeof initialValue !== 'undefined') {
      setSessionStorageItem(key, initialValue)
    }
  }, [key, initialValue])

  return [store ? JSON.parse(store) : initialValue, setState] as [T, React.Dispatch<React.SetStateAction<T>>]
}
