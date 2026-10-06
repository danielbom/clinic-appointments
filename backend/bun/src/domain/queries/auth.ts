import { db } from '../../core/db'

export type Identity = {
  id: string
  name: string
  email: string
  password: string
  role: 'admin' | 'secretary'
}

export async function queryIdentity(options: { email: string } | { userId: string }): Promise<Identity | null> {
  const where = 'email' in options ? { email: options.email } : { id: options.userId }
  const admin = await db.admins.findUnique({ where })

  if (admin) {
    return {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      password: admin.password,
      role: 'admin',
    }
  }

  const secretary = await db.secretaries.findUnique({ where })

  if (secretary) {
    return {
      id: secretary.id,
      name: secretary.name,
      email: secretary.email,
      password: secretary.password,
      role: 'secretary',
    }
  }

  return null
}
