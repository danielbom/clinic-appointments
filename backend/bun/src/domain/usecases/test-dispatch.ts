import { db } from '../../core/db'
import { generateId } from '../../core/id'
import { hashPassword } from '../../core/password'
import type * as types from '../../http/types'

export async function testDispatch(args: types.api.test.testDispatch.body) {
  switch (args.kind) {
    case 'INIT':
      return await initTest()
    default:
      throw new Error('unexpected')
  }
}

async function initTest(): Promise<string> {
  await db.$transaction(async (tx) => {
    await tx.admins.deleteMany()
    await tx.appointments.deleteMany()
    await tx.customers.deleteMany()
    await tx.secretaries.deleteMany()
    await tx.services.deleteMany()
    await tx.service_names.deleteMany()
    await tx.specialists.deleteMany()
    await tx.specialist_hours.deleteMany()
    await tx.specializations.deleteMany()

    await tx.admins.create({
      data: {
        id: generateId(),
        name: 'Admin Test',
        email: 'admin@test.com',
        password: await hashPassword('123mudar'),
      },
    })
  })
  return 'System initialized to be tested'
}
