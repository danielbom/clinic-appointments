import { QueryClient } from '@tanstack/react-query'

// To facilitate cache invalidation, all resources are expected to be prefixed with '#',
// so this function can invalidate all queries that have a key that includes the '#' character.
export function invalidateQueries(queryClient: QueryClient, key: string) {
  queryClient.invalidateQueries({
    predicate: (query) => query.queryKey.includes(key),
  })
}
