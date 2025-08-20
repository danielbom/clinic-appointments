import { AxiosResponse } from 'axios'
import { Config } from '../Config'

export class AppointmentsEndpoint {
  constructor(public config: Config) {}

  list(params?: AppointmentsListQuery): Promise<AxiosResponse<any>> {
    return this.config.instance.get('/appointments', { params })
  }

  create(data: CreateAppointmentBody): Promise<AxiosResponse<any>> {
    return this.config.instance.post('/appointments', data)
  }

  count(params?: AppointmentsQuery): Promise<AxiosResponse<any>> {
    return this.config.instance.get('/appointments/count', { params })
  }

  calendar(params?: AppointmentsCalendarQuery): Promise<AxiosResponse<any>> {
    return this.config.instance.get('/appointments/calendar', { params })
  }

  countCalendar(params?: AppointmentsCalendarQuery): Promise<AxiosResponse<any>> {
    return this.config.instance.get('/appointments/calendar/count', { params })
  }

  get(appointmentId: string): Promise<AxiosResponse<any>> {
    return this.config.instance.get(`/appointments/${appointmentId}`)
  }

  update(appointmentId: string, data: UpdateAppointmentBody): Promise<AxiosResponse<any>> {
    return this.config.instance.put(`/appointments/${appointmentId}`, data)
  }

  remove(appointmentId: string): Promise<AxiosResponse<any>> {
    return this.config.instance.delete(`/appointments/${appointmentId}`)
  }
}

export type AppointmentsQuery = Partial<{
  serviceName: string
  specialist: string
  customer: string
  startDate: string
  endDate: string
}>

export type AppointmentsListQuery = Partial<{
  page: number
  pageSize: number
  serviceName: string
  specialist: string
  customer: string
  startDate: string
  endDate: string
}>

export type AppointmentsCalendarQuery = Partial<{
  startDate: string
  endDate: string
}>

export type UpdateAppointmentBody = {
  date: string
  time: string
  status: number
}

export type CreateAppointmentBody = {
  customerId: string
  serviceId: string
  date: string
  time: string
}
