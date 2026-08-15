import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../prisma/client'
import { getDatabaseConfig } from './config'
import type { InfraStatus } from './infra'

const config = getDatabaseConfig()
const adapter = new PrismaPg({
  connectionString: config.connectionString,
  connectionTimeoutMillis: 5_000,
  idleTimeoutMillis: 300_000,
  max: 10,
})
export const db = new PrismaClient({ adapter })

export async function closeDb(): Promise<void> {
  await db.$disconnect()
}

export async function pingDatabase(): Promise<InfraStatus> {
  const startTime = Date.now()
  let status: InfraStatus['status'] = 'DOWN'
  try {
    await db.$queryRaw`SELECT 1`
    status = 'UP'
  } catch {
    // nop
  }
  const latencyMs = Date.now() - startTime
  status = status === 'UP' && latencyMs > 500 ? 'DEGRADED' : status
  return { status, latencyMs }
}
