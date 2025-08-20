import z from 'zod'

export const ServiceAvailableSchema = z.strictObject({
  serviceName: z.string(),
  serviceNameId: z.uuidv4(),
  specialization: z.string(),
  specializationId: z.uuidv4(),
})

export type ServiceAvailable = z.infer<typeof ServiceAvailableSchema>
