import { createContext, useContext, useReducer } from 'react'

import type { PageMode } from '../../components/AdminX/types'

type PageKey = string

type PageItem = {
  key: PageKey
  label: string
  icon: React.ReactNode
}

type PageState = {
  pageKey: PageKey
  items: PageItem[]
  state: Record<string, string>
  mode: PageMode
}

type PageAction =
  | { type: 'REGISTER_ITEM'; payload: PageItem }
  | { type: 'SET_PAGE_KEY'; payload: string }
  | { type: 'SET_PAGE_KEY_AND_LIST'; payload: string }
  | { type: 'SET_MODE'; payload: PageMode }
  | { type: 'SET_STATE_MODE'; payload: { state: Record<string, string>; mode: PageMode } }
  | { type: 'SET_STATE'; payload: Record<string, string> }

function pageReducer(state: PageState, action: PageAction): PageState {
  switch (action.type) {
    case 'REGISTER_ITEM':
      return {
        ...state,
        items: state.items.find((it) => it.key === action.payload.key) ? state.items : [...state.items, action.payload],
      }
    case 'SET_PAGE_KEY':
      return { ...state, pageKey: action.payload }
    case 'SET_PAGE_KEY_AND_LIST':
      return { ...state, pageKey: action.payload, mode: 'list' }
    case 'SET_MODE':
      return { ...state, mode: action.payload }
    case 'SET_STATE_MODE':
      return { ...state, state: action.payload.state, mode: action.payload.mode }
    case 'SET_STATE':
      return { ...state, state: action.payload }
    default:
      return state
  }
}

const PAGE_INITIAL_STATE: PageState = {
  pageKey: '',
  items: [],
  state: {},
  mode: 'list',
}

const AdminContext = createContext({
  state: PAGE_INITIAL_STATE,
  dispatch: (() => {}) as React.Dispatch<PageAction>,
})

export type AdminContext = ReturnType<typeof useAdmin>

function AdminProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(pageReducer, PAGE_INITIAL_STATE)

  return <AdminContext.Provider value={{ state, dispatch }}>{children}</AdminContext.Provider>
}

function useAdmin() {
  return useContext(AdminContext)
}

export { AdminProvider, AdminContext, useAdmin }
