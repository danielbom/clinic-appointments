import { type AxiosResponse } from 'axios'
import { type Config } from '../Config'
import { type Id } from './types'

export class AppointmentsEndpoint {
  constructor(public _config: Config) {}

  async getAll(query: AppointmentsGetAllQuery = {}): Promise<AxiosResponse<Appointment[]>> {
    return await this._config.instance.get(`/api/appointments`, { params: query })
  }

  async count(query: AppointmentsCountAllQuery = {}): Promise<AxiosResponse<number>> {
    return await this._config.instance.get(`/api/appointments/count`, { params: query })
  }

  async getCalendar(query: AppointmentsGetCalendarQuery): Promise<AxiosResponse<AppointmentCalendar[]>> {
    return await this._config.instance.get(`/api/appointments/calendar`, { params: query })
  }

  async getCalendarCount(query: AppointmentsGetCalendarQuery): Promise<AxiosResponse<AppointmentCalendarCount[]>> {
    return await this._config.instance.get(`/api/appointments/calendar/count`, { params: query })
  }

  async getById(id: string): Promise<AxiosResponse<Appointment>> {
    return await this._config.instance.get(`/api/appointments/${id}`)
  }

  async create(data: AppointmentsCreateBody): Promise<AxiosResponse<Id>> {
    return await this._config.instance.post(`/api/appointments`, data)
  }

  async update(id: string, data: AppointmentsUpdateBody): Promise<AxiosResponse<Id>> {
    return await this._config.instance.put(`/api/appointments/${id}`, data)
  }

  async delete(id: string): Promise<AxiosResponse<void>> {
    return await this._config.instance.delete(`/api/appointments/${id}`)
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
