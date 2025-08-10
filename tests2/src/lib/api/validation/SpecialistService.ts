import z from 'zod'

export const SpecialistServiceSchema = z.strictObject({
  id: z.uuidv4(),
  duration: z.number(),
  price: z.number(),
  serviceName: z.string(),
  serviceNameId: z.uuidv4(),
  specializationId: z.uuidv4(),
})

export type SpecialistService = z.infer<typeof SpecialistServiceSchema>
