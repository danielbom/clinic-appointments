import { useCallback, useReducer } from 'react'

type Undo<T> = {
  previous: T[]
  next: T[]
  top: T[]
  max: number
}

type Action<T> =
  | { type: 'UNDO_PUSH'; item: T } //
  | { type: 'UNDO_POP'; item: T }
  | { type: 'REDO_POP' }

function reducer<T>({ max, next, previous }: Undo<T>, action: Action<T>): Undo<T> {
  switch (action.type) {
    case 'REDO_POP': {
      return {
        max,
        next: next.length > 0 ? next.slice(0, next.length - 1) : next,
        previous: previous.length > 0 ? [...previous, next[next.length - 1]] : previous,
        top: next.length > 0 ? [next[next.length - 1]] : next,
      }
    }
    case 'UNDO_PUSH': {
      return {
        max,
        next: [],
        top: [action.item],
        previous: [...previous, action.item].slice(Math.max(0, previous.length - max + 1), previous.length + 1),
      }
    }
    case 'UNDO_POP': {
      return {
        max,
        previous: previous.length > 0 ? previous.slice(0, previous.length - 1) : previous,
        next: [...next, action.item],
        top: previous.length > 1 ? [previous[previous.length - 2]] : previous,
      }
    }
  }
  throw new Error('Undo.reducer() unrechable')
}

const INITIAL_STATE: Undo<any> = {
  max: 0,
  next: [],
  previous: [],
  top: [],
}

export function useUndo<T>(initialValue: T, maxUndo = 20) {
  const [{ top }, dispatch] = useReducer(reducer<T>, INITIAL_STATE, (state) =>
    reducer({ ...state, max: maxUndo }, { type: 'UNDO_PUSH', item: initialValue }),
  )

  const pushUndo = useCallback((item: T) => dispatch({ type: 'UNDO_PUSH', item }), [dispatch])
  const popUndo = useCallback((item: T) => dispatch({ type: 'UNDO_POP', item }), [dispatch])
  const popRedo = useCallback(() => dispatch({ type: 'REDO_POP' }), [dispatch])

  return { top: top[0], pushUndo, popUndo, popRedo }
}
