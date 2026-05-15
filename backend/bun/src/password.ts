const saltRounds = 10

export async function hashPassword(password: string) {
  const hash = await Bun.password.hash(password, {
    algorithm: 'bcrypt',
    cost: saltRounds,
  })
  return hash
}

export async function verifyPassword(password: string, hash: string) {
  return await Bun.password.verify(password, hash)
}
