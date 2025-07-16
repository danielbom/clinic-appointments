import { AxiosResponse } from "axios"
import { Config } from "../Config"

export class AppointmentsEndpoint {
  constructor(public config: Config) {}

  list(page: number, pageSize: number, serviceName: string, specialist: string, customer: string, startDate: string, endDate: string): Promise<AxiosResponse<any>> {
    return this.config.instance.get(`/appointments`)
  }

  create(data: CreateAppointmentBody): Promise<AxiosResponse<any>> {
    return this.config.instance.post(`/appointments`, data)
  }

  count(serviceName: string, specialist: string, customer: string, startDate: string, endDate: string): Promise<AxiosResponse<any>> {
    return this.config.instance.get(`/appointments/count`)
  }

  calendar(startDate: string, endDate: string): Promise<AxiosResponse<any>> {
    return this.config.instance.get(`/appointments/calendar`)
  }

  countCalendar(startDate: string, endDate: string): Promise<AxiosResponse<any>> {
    return this.config.instance.get(`/appointments/calendar/count`)
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

export type UpdateAppointmentBody = {
  date: string,
  time: string,
  status: number
}

export type CreateAppointmentBody = {
  customerId: string,
  serviceId: string,
  date: string,
  time: string
}
