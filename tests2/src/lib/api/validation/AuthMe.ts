import z from 'zod'

export const AuthMeSchema = z.strictObject({
  id: z.uuidv4(),
  name: z.string(),
  email: z.email(),
  role: z.enum(['admin', 'secretary']),
})

export type AuthMe = z.infer<typeof AuthMeSchema>
