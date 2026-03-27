import { PageMode, PageState, PageStateCompatible } from './types'

export function getPageMode(state: Record<string, string>, defaultValue: PageMode): PageMode {
  if (!state.mode) return defaultValue
  if (['list', 'show', 'create', 'edit'].includes(state.mode)) return state.mode as PageMode
  throw new Error('invalid state mode: ' + state.mode)
}

export function changeMode(mode: PageMode, state?: PageStateCompatible): PageState {
  const newState: PageState = { mode }
  if (state) {
    for (const key in state) {
      if (state[key] === 0 || state[key]) {
        newState[key] = state[key].toString()
      }
    }
  }
  return newState
}
