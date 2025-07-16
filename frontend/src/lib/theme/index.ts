import { ThemeConfig } from 'antd'
import { THEME_KEY } from '../keys'
import { TypeCheck, is, checkObjectStrict } from '../type-check'

const themeTokenCheck: TypeCheck<ThemeConfig['token']> = {
  motion: (value) => is.undefined(value) || is.boolean(value),
}
const themeCheck: TypeCheck<ThemeConfig> = {
  token: (value) => is.undefined(value) || checkObjectStrict(value, themeTokenCheck),
}

function parseTheme(theme: string | null): ThemeConfig | null {
  if (theme) {
    try {
      const result = JSON.parse(theme)
      if (checkObjectStrict(result, themeCheck)) {
        return result
      }
    } catch (error) {}
  }
  return null
}

export function loadTheme(): ThemeConfig {
  const storageTheme = localStorage.getItem(THEME_KEY)
  if (storageTheme) {
    const theme = parseTheme(storageTheme)
    if (theme) {
      return theme
    } else {
      localStorage.removeItem(THEME_KEY)
    }
  }
  return {}
}
