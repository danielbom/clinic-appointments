import type { AxiosResponse } from 'axios'
import type {
  Api,
  Appointment,
  AppointmentsEndpoint,
  AuthEndpoint,
  Config,
  Customer,
  CustomersEndpoint,
  SecretariesEndpoint,
  Service,
  ServiceAvailableGroup,
  ServiceGroupsEndpoint,
  ServicesEndpoint,
  Specialist,
  SpecialistsEndpoint,
  SpecializationsEndpoint,
} from '../api'
import { AppointmentStatus } from '../api'
import { ServicesAvailableEndpoint } from '../api/endpoints/ServicesAvailableEndpoint'

function _paginate<T>(items: T[], options: { page?: number; pageSize?: number } = {}): T[] {
  const start = (options.page ?? 1) * (options.pageSize ?? 10)
  const end = start + (options.pageSize ?? 10)
  return items.slice(start, end)
}

function _req<T>(data: T): AxiosResponse<T> {
  return {
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
  } as AxiosResponse<T>
}

const _get = _req
const _post = _req
const _put = _req
const _delete = () => _req<void>(void 0)

function choice<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length) % list.length]
}

function randomDigits(length: number): string {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('')
}

function choices<T>(list: T[], count: number): T[] {
  return list
    .slice()
    .sort(() => Math.random() - 0.5)
    .slice(0, count)
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function roundInt(value: number, precision: number): number {
  const factor = Math.pow(10, precision)
  return Math.round(value / factor) * factor
}

const filterId =
  (id: string) =>
  <T extends { id: string }>(it: T) =>
    it.id === id

const specialists: Specialist[] = Array.from({ length: randomInt(21, 99) }, (_, i) => ({
  id: `specialist-fake-${i + 1}`,
  name: `Specialist ${i + 1}`,
  birthdate: `${randomInt(1950, 1999)}-${randomInt(1, 12)}-${randomInt(1, 28)}`,
  cnpj: randomDigits(14),
  cpf: randomDigits(11),
  email: `specialist-fake-${i + 1}@email.com`,
  phone: choice(['449', '119', '189']) + randomDigits(8),
}))
const serviceGroups: ServiceAvailableGroup[] = (() => {
  let serviceId = 1
  let specializationId = 1
  return Array.from({ length: 8 }, () => {
    const id1 = specializationId++
    return {
      id: `service-group-fake-${id1}`,
      name: `Service Group ${id1}`,
      items: Array.from({ length: 4 }, (_) => {
        const id2 = serviceId++
        return {
          id: `service-fake-${id2}`,
          name: `Service ${id2}`,
        }
      }),
    }
  })
})()

const services: Service[] = (() => {
  let specialistServiceId = 1
  return specialists.flatMap((specialist) => {
    const specialization = choices(serviceGroups, 2)
    return specialization.flatMap((specialization) => {
      const services = choices(specialization.items, randomInt(2, specialization.items.length - 1))
      return services.map((service) => {
        const id = specialistServiceId++
        return {
          id: `specialist-service-fake-${id}`,
          duration: roundInt(randomInt(30, 120), 1) * 60,
          serviceName: service.name,
          serviceNameId: service.id,
          price: roundInt(randomInt(50, 500), 1) * 100,
          specialistId: specialist.id,
          specialistName: specialist.name,
          specializationId: specialization.id,
          specialization: specialization.name,
        }
      })
    })
  })
})()

const customers: Customer[] = Array.from({ length: randomInt(99, 999) }, (_, i) => ({
  id: `customer-fake-${i + 1}`,
  name: `Customer ${i + 1}`,
  birthdate: `${randomInt(1950, 1999)}-${randomInt(1, 12)}-${randomInt(1, 28)}`,
  cpf: randomDigits(11),
  email: `customer${i + 1}@email.com`,
  phone: choice(['449', '119', '189']) + randomDigits(8),
}))

const hours: string[] = Array.from({ length: 18 - 9 }, (_, i) => i + 9).flatMap((hour) => [
  `${String(hour).padStart(2, '0')}:00`,
  `${String(hour).padStart(2, '0')}:30`,
])

const now = new Date().toISOString()
const appointments: Appointment[] = (() => {
  let appointmentId = 1
  return services
    .flatMap((service) => {
      return choices(customers, randomInt(1, 5)).map((customer) => {
        const date = `${randomInt(2023, 2025)}-${String(randomInt(1, 12)).padStart(2, '0')}-${String(randomInt(1, 28)).padStart(2, '0')}`
        const id = appointmentId++
        return {
          id: `appointment-fake-${id}`,
          customerId: customer.id,
          customerName: customer.name,
          serviceNameId: service.id,
          serviceName: service.serviceName,
          duration: service.duration,
          price: service.price,
          specialistId: service.specialistId,
          specialistName: service.specialistName,
          status:
            date > now
              ? choice([AppointmentStatus.Canceled, AppointmentStatus.Pending])
              : choice([
                  AppointmentStatus.Canceled,
                  AppointmentStatus.Realized,
                  AppointmentStatus.Realized,
                  AppointmentStatus.Realized,
                ]),
          time: choice(hours),
          date,
        }
      })
    })
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
})()

export class ApiFake implements Api {
  constructor(public _config: Config) {}

  public auth: AuthEndpoint = {
    _config: this._config,
    login: async (_data) => _post({ accessToken: 'fake-access-token', refreshToken: 'fake-refresh-token' }),
    me: async () => _get({} as any),
    refresh: async () => _post({} as any),
  }

  public appointments: AppointmentsEndpoint = {
    _config: this._config,
    count: async () => _get(appointments.length),
    create: async (_data) => _post('id'),
    update: async (_id, _data) => _put({ id: 'id' }),
    delete: async (_id) => _delete(),
    getAll: async (data) => _get(_paginate(appointments, data)),
    getById: async (id) => _get(appointments.find(filterId(id))!),
    getCalendar: async (data) => _get(appointments.filter((it) => data.startDate < it.date && it.date <= data.endDate)),
    getCalendarCount: async (data) =>
      _get(
        appointments
          .filter((it) => data.startDate < it.date && it.date <= data.endDate)
          .map((it) => [Number(it.date.slice(5, 7)), it.status, it] as const)
          .reduce(
            (group, it) => {
              switch (it[1]) {
                case AppointmentStatus.Pending:
                  group[it[0] - 1].pendingCount++
                  break
                case AppointmentStatus.Realized:
                  group[it[0] - 1].realizedCount++
                  break
                case AppointmentStatus.Canceled:
                  group[it[0] - 1].canceledCount++
                  break
              }
              return group
            },
            Array.from({ length: 12 }, (_, i) => ({
              month: i,
              pendingCount: 0,
              realizedCount: 0,
              canceledCount: 0,
            })),
          ),
      ),
  }

  public customers: CustomersEndpoint = {
    _config: this._config,
    count: async () => _get(customers.length),
    create: async (_data) => _post('id'),
    update: async (_id, _data) => _put({ id: 'id' }),
    delete: async (_id) => _delete(),
    getAll: async (data) => _get(_paginate(customers, data)),
    getById: async (id) => _get(customers.find(filterId(id))!),
  }

  public secretaries: SecretariesEndpoint = {
    _config: this._config,
    count: async () => _get(0),
    create: async (_data) => _post('id'),
    update: async (_id, _data) => _put({ id: 'id' }),
    delete: async (_id) => _delete(),
    getAll: async (_data) => _get([]),
    getById: async (_id) => _get({} as any),
  }

  public serviceGroups: ServiceGroupsEndpoint = {
    _config: this._config,
    getAll: async () => _get(serviceGroups),
  }

  public services: ServicesEndpoint = {
    _config: this._config,
    count: async () => _get(services.length),
    create: async (_data) => _post('id'),
    update: async (_id, _data) => _put({ id: 'id' }),
    delete: async (_id) => _delete(),
    getAll: async (data) => _get(_paginate(services, data)),
    getById: async (id) => _get(services.find(filterId(id))!),
  }

  public servicesAvailable: ServicesAvailableEndpoint = {
    _config: this._config,
    create: async (_data) => _post('id'),
    update: async (_id, _data) => _put('id'),
    getById: async (id) => _get(services.find((it) => it.id === id)!),
    delete: async (_id) => _delete(),
    getAll: async () => _get(serviceGroups),
  }

  public specialists: SpecialistsEndpoint = {
    _config: this._config,
    count: async () => _get(specialists.length),
    create: async (_data) => _post('id'),
    update: async (_id, _data) => _put({ id: 'id' }),
    delete: async (_id) => _delete(),
    getById: async (_id) => _get(specialists.find(filterId(_id))!),
    getAll: async (data) => _get(_paginate(specialists, data)),
    getAppointments: async (id) =>
      _get(appointments.filter((it) => it.specialistId === id).map((it) => ({ ...it, serviceId: it.serviceNameId }))),
    getServices: async (id) =>
      _get(services.filter(filterId(id)).map((it) => ({ ...it, serviceId: it.id, name: it.serviceName }))),
    getSpecializations: async (id) =>
      _get(serviceGroups.filter(filterId(id)).map((it) => ({ id: it.id, name: it.name }))),
    getService: async (id, serviceId) =>
      _get(services.find((it) => it.serviceNameId === serviceId && it.specialistId == id)!),
  }

  public specializations: SpecializationsEndpoint = {
    _config: this._config,
    getAll: async () => _get(serviceGroups),
    create: async (_data) => _post('id'),
    delete: async (_id) => _delete(),
    update: async (_id, _data) => _put({ id: 'id' }),
  }
}
