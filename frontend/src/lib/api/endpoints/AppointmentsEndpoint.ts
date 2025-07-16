import { AxiosResponse } from 'axios'
import { Config } from '../Config'

export class AppointmentsEndpoint {
  constructor(public _config: Config) {}

  getAll(query: AppointmentsGetAllQuery = {}): Promise<AxiosResponse<Appointment[]>> {
    return this._config.instance.get(`/appointments`, { params: query })
  }

  count(query: AppointmentsCountAllQuery = {}): Promise<AxiosResponse<number>> {
    return this._config.instance.get(`/appointments/count`, { params: query })
  }

  getCalendar(query: AppointmentsGetCalendarQuery): Promise<AxiosResponse<AppointmentCalendar[]>> {
    return this._config.instance.get(`/appointments/calendar`, { params: query })
  }

  getCalendarCount(query: AppointmentsGetCalendarQuery): Promise<AxiosResponse<AppointmentCalendarCount[]>> {
    return this._config.instance.get(`/appointments/calendar/count`, { params: query })
  }

  getById(id: string): Promise<AxiosResponse<Appointment>> {
    return this._config.instance.get(`/appointments/${id}`)
  }

  create(data: AppointmentsCreateBody): Promise<AxiosResponse<string>> {
    return this._config.instance.post(`/appointments`, data)
  }

  update(id: string, data: AppointmentsUpdateBody): Promise<AxiosResponse<any>> {
    return this._config.instance.put(`/appointments/${id}`, data)
  }

  delete(id: string): Promise<AxiosResponse<void>> {
    return this._config.instance.delete(`/appointments/${id}`)
  }
}

export const AppointmentStatus = {
  None: 0,
  Pending: 1,
  Realized: 2,
  Canceled: 3,
  Count: 4,
} as const

export type Appointment = {
  id: string
  customerName: string
  customerId: string
  serviceName: string
  serviceNameId: string
  specialistName: string
  specialistId: string
  price: number
  duration: number
  date: string
  time: string
  status: number
}

export type AppointmentsCountAllQuery = {
  startDate?: string
  endDate?: string
  serviceName?: string
  specialist?: string
  customer?: string
  status?: number
}

export type AppointmentsGetAllQuery = AppointmentsCountAllQuery & {
  page?: number
  pageSize?: number
}

export type AppointmentsGetCalendarQuery = {
  startDate: string
  endDate: string
}

export type AppointmentCalendar = {
  id: string
  date: string
  time: string
  specialistName: string
  status: number
}

export type AppointmentCalendarCount = {
  month: number
  pendingCount: number
  realizedCount: number
  canceledCount: number
}

export type AppointmentsCreateBody = {
  customerId: string
  serviceId: string
  date: string
  time: string
}

export type AppointmentsUpdateBody = {
  date: string
  time: string
  status: number
}
