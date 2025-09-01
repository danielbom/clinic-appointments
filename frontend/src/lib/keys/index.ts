const mkAuto = (prefix: string) => (key: string) => `${prefix}:${key}`
const auto = mkAuto('as')

export const AUTH_ACCESS_KEY = auto('auth-access')
export const AUTH_REFRESH_KEY = auto('auth-refresh')
export const PRIVATE_PAGE = auto('private-page')
export const THEME_KEY = auto('theme')
export const CREATE_APPOINTMENTS_DATA_KEY = auto('create-appointments')
