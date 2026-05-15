import bcrypt from 'bcrypt'

const saltRounds = 10

export async function hashPassword(password: string) {
  const hash = await bcrypt.hash(password, saltRounds)
  return hash
}

export async function verifyPassword(password: string, hash: string) {
  return await bcrypt.compare(password, hash)
}
