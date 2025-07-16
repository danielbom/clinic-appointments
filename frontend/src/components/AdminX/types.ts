export type PageMode = 'list' | 'show' | 'create' | 'edit'
export type PageStateCompatible = Record<string, string | number>
export type PageState = Record<string, string>
export type ChangePageMode = (mode: PageMode, state?: PageStateCompatible) => void
