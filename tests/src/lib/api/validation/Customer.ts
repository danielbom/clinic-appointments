import z from 'zod'

export const CustomerSchema = z.strictObject({
  id: z.uuidv4(),
  name: z.string(),
  email: z.email(),
  phone: z.string(),
  birthdate: z.coerce.date(),
  cpf: z.string(),
})

export type Customer = z.infer<typeof CustomerSchema>
