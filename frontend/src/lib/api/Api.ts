import { Config } from './Config'
import { AppointmentsEndpoint } from './endpoints/AppointmentsEndpoint'
import { AuthEndpoint } from './endpoints/AuthEndpoint'
import { CustomersEndpoint } from './endpoints/CustomersEndpoint'
import { SpecialistsEndpoint } from './endpoints/SpecialistsEndpoint'
import { SpecializationsEndpoint } from './endpoints/SpecializationsEndpoint'
import { ServicesEndpoint } from './endpoints/ServicesEndpoint'
import { ServiceGroupsEndpoint } from './endpoints/ServiceGroupsEndpoint'
import { ServicesAvailableEndpoint } from './endpoints/ServicesAvailableEndpoint'
import { SecretariesEndpoint } from './endpoints/SecretariesEndpoint'

export class Api {
  public auth: AuthEndpoint
  public appointments: AppointmentsEndpoint
  public customers: CustomersEndpoint
  public secretaries: SecretariesEndpoint
  public specialists: SpecialistsEndpoint
  public specializations: SpecializationsEndpoint
  public services: ServicesEndpoint
  public serviceGroups: ServiceGroupsEndpoint
  public servicesAvailable: ServicesAvailableEndpoint

  constructor(public _config: Config) {
    this.auth = new AuthEndpoint(_config)
    this.appointments = new AppointmentsEndpoint(_config)
    this.secretaries = new SecretariesEndpoint(_config)
    this.customers = new CustomersEndpoint(_config)
    this.specialists = new SpecialistsEndpoint(_config)
    this.specializations = new SpecializationsEndpoint(_config)
    this.services = new ServicesEndpoint(_config)
    this.serviceGroups = new ServiceGroupsEndpoint(_config)
    this.servicesAvailable = new ServicesAvailableEndpoint(_config)
  }
}
