import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../prisma/client'
import { getDatabaseConfig } from './config'
import type { InfraStatus } from './infra'

const config = getDatabaseConfig()
const pool = new Pool({ connectionString: config.connectionString, max: 10 })
const adapter = new PrismaPg({ connectionString: config.connectionString })
export const db = new PrismaClient({ adapter })

export async function closeDb(): Promise<void> {
  await db.$disconnect()
  await pool.end()
}

export async function checkDatabase(): Promise<InfraStatus> {
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
