import { lazy } from 'react'

const ReactQueryDevtoolsLazy = lazy(async () => {
  if (import.meta.env.PROD) {
    return { default: () => null }
  } else {
    const m = await import('@tanstack/react-query-devtools')
    return { default: m.ReactQueryDevtools }
  }
})

export default ReactQueryDevtoolsLazy
