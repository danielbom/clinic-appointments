import z from 'zod'

export const AuthTokenSchema = z.strictObject({
  accessToken: z.string(),
  refreshToken: z.string(),
})

export type AuthToken = z.infer<typeof AuthTokenSchema>
