import { z } from 'zod'

export const ServiceGroupsSchema = z.array(
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

export type ServiceGroups = z.infer<typeof ServiceGroupsSchema>;
