export type InfraStatus = {
  status: 'UP' | 'DEGRADED' | 'DOWN'
  latencyMs: number
  [key: string]: any
}
