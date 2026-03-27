import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

/*
function useSearchParam(key: string) {
  const [search, setSearch] = useSearchParams({})

  const setSearchKey = useCallback(
    (value: string) => {
      setSearch((prevSearch) => {
        const dict = new Map(prevSearch.entries())
        if (value) {
          dict.set(key, value)
        } else {
          dict.delete(key)
        }
        return new URLSearchParams(Array.from(dict.entries()))
      })
    },
    [key],
  )

  return [search.get(key) ?? undefined, setSearchKey] as const
}

function makeUseSearchParam<T>(converter: (value: string) => T) {
  return function useSearchParamT(key: string) {
    const [query, setQuery] = useSearchParam(key)
    const value = useMemo(() => (query === undefined ? undefined : converter(query)), [query])

    const setValue = useCallback(
      (newValue: T | undefined) => {
        setQuery(String(newValue ?? ''))
      },
      [key, setQuery],
    )

    return [value, setValue] as const
  }
}

const useSearchParamString = makeUseSearchParam((value) => value)
const useSearchParamNumber = makeUseSearchParam((value) => Number(value))
const useSearchParamBool = makeUseSearchParam((value) => value === 'true' || value === '1')
*/

type ParamsState = Record<string, string>

export function useSearchParamState() {
  const [search, setSearch] = useSearchParams()

  const state: ParamsState = useMemo(() => Object.fromEntries(search.entries()), [search])

  const setState = useCallback(
    (newState: ParamsState, { merge = false } = {}) => {
      setSearch((prev) => {
        if (merge) {
          const params = new URLSearchParams(prev)
          Object.entries(newState).forEach(([k, v]) => params.set(k, v))
          return params
        } else {
          return new URLSearchParams(newState)
        }
      })
    },
    [setSearch],
  )

  return [state, setState] as const
}
