import z from 'zod'

export const StatusSchema = z.strictObject({
  status: z.boolean(),
  updatedAt: z.coerce.date(),
  environment: z.string(),
  database: z.strictObject({
    status: z.enum(['connected', 'disconnected']),
    version: z.string(),
    maxConnections: z.number().int().min(0),
    openedConnections: z.number().int().min(0),
  })
})

export type Status = z.infer<typeof StatusSchema>
