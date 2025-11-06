import { Client } from 'pg'
import * as queries from './db/queries'

export const client = new Client({
  host: 'localhost',
  user: 'postgres',
  password: '123456789',
  port: 5432,
  database: 'appointments',
})

async function main() {
  await client.connect()
  await queries.admin.createAdmin.run({}, client)
  await queries.appointments.appointmentsIntersects.run({}, client)
  await queries.appointments.countAppointments.run({}, client)
  await queries.appointments.createAppointment.run({}, client)
  await queries.appointments.deleteAppointment.run({}, client)
  await queries.appointments.getAppointmentById.run({}, client)
  await queries.appointments.getAppointmentEnrichedById.run({}, client)
  await queries.customers.getCustomerById.run({}, client)
  await client.end()
}

main()
