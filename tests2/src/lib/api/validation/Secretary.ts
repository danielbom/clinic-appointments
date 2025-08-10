import { z } from 'zod'

export const SecretarySchema = z.strictObject({
  id: z.uuidv4(),
  name: z.string(),
  email: z.email(),
  phone: z.string(),
  birthdate: z.coerce.date(),
  cpf: z.string(),
  cnpj: z.string(),
})

export type Secretary = z.infer<typeof SecretarySchema>
