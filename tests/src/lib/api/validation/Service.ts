import z from 'zod'

export const ServiceSchema = z.strictObject({
  id: z.uuidv4(),
  duration: z.number(),
  price: z.number(),
  serviceName: z.string(),
  serviceNameId: z.uuidv4(),
  specialistName: z.string(),
  specialistId: z.uuidv4(),
  specialization: z.string(),
  specializationId: z.uuidv4(),
})

export type Service = z.infer<typeof ServiceSchema>
