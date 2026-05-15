import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from './prisma/client'
import { getDatabaseConfig } from './core/config'

const config = getDatabaseConfig()
const adapter = new PrismaPg({ connectionString: config.connectionString })
export const db = new PrismaClient({ adapter })

// export const dbLog = new PrismaClient({
//   adapter,
//   log: ['query'],
// })
// export const db = dbLog;
