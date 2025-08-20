import z from 'zod'

export const SpecializationSchema = z.strictObject({
  id: z.uuidv4(),
  name: z.string(),
})

export type Specialization = z.infer<typeof SpecializationSchema>
