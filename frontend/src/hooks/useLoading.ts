import { useCallback, useState } from 'react'

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function useLoading() {
  const [loading, setLoading] = useState(false)

  const loader = useCallback(
    async (promise: () => Promise<any>, delay = 0) => {
      if (loading) return
      setLoading(true)
      try {
        await promise()
        if (delay > 0) await sleep(delay)
      } finally {
        setLoading(false)
      }
    },
    [loading],
  )

  return [loading, loader] as const
}

export default useLoading
