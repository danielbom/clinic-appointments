import z from 'zod'

export const AppointmentSchema = z.strictObject({
  id: z.uuidv4(),
  customerName: z.string(),
  customerId: z.uuidv4(),
  serviceName: z.string(),
  serviceNameId: z.uuidv4(),
  specialistName: z.string(),
  specialistId: z.uuidv4(),
  price: z.int(),
  duration: z.int(),
  date: z.coerce.date(),
  time: z.string(),
  status: z.number(),
})

export type Appointment = z.infer<typeof AppointmentSchema>
