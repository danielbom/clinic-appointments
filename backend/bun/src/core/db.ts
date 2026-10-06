import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../prisma/client'
import { getDatabaseConfig } from './config'

const config = getDatabaseConfig()
const adapter = new PrismaPg({
  connectionString: config.connectionString,
  connectionTimeoutMillis: 5_000,
  idleTimeoutMillis: 300_000,
  max: 10,
})
export const db = new PrismaClient({ adapter })

export type Transaction = typeof db.$transaction extends (tx: (tx: infer Tx) => any) => any ? Tx : never

export async function closeDb(): Promise<void> {
  await db.$disconnect()
}
