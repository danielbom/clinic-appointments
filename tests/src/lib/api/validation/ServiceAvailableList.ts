import z from 'zod'

export const ServiceAvailableListSchema = z.array(
  z.strictObject({
    id: z.uuidv4(),
    name: z.string(),
    items: z.array(
      z.strictObject({
        id: z.uuidv4(),
        name: z.string(),
      }),
    ),
  }),
)

export type ServiceAvailableList = z.infer<typeof ServiceAvailableListSchema>
