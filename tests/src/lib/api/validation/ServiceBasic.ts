import z from 'zod'

export const ServiceBaseSchema = z.strictObject({
  id: z.uuidv4(),
  duration: z.number(),
  price: z.number(),
  serviceNameId: z.uuidv4(),
  specialistId: z.uuidv4(),
})

export type ServiceBase = z.infer<typeof ServiceBaseSchema>
