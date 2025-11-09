import { Config } from './Config'
import { AppointmentsEndpoint } from './endpoints/AppointmentsEndpoint'
import { AuthEndpoint } from './endpoints/AuthEndpoint'
import { CustomersEndpoint } from './endpoints/CustomersEndpoint'
import { HealthEndpoint } from './endpoints/HealthEndpoint'
import { SecretariesEndpoint } from './endpoints/SecretariesEndpoint'
import { ServiceGroupsEndpoint } from './endpoints/ServiceGroupsEndpoint'
import { ServicesAvailableEndpoint } from './endpoints/ServicesAvailableEndpoint'
import { ServicesEndpoint } from './endpoints/ServicesEndpoint'
import { SpecialistsEndpoint } from './endpoints/SpecialistsEndpoint'
import { SpecializationsEndpoint } from './endpoints/SpecializationsEndpoint'
import { TestEndpoint } from './endpoints/TestEndpoint'

export class Api {
  public appointments: AppointmentsEndpoint
  public auth: AuthEndpoint
  public customers: CustomersEndpoint
  public health: HealthEndpoint
  public secretaries: SecretariesEndpoint
  public serviceGroups: ServiceGroupsEndpoint
  public services: ServicesEndpoint
  public servicesAvailable: ServicesAvailableEndpoint
  public specialists: SpecialistsEndpoint
  public specializations: SpecializationsEndpoint
  public test: TestEndpoint

  constructor(public _config: Config) {
    this.appointments = new AppointmentsEndpoint(_config)
    this.auth = new AuthEndpoint(_config)
    this.customers = new CustomersEndpoint(_config)
    this.health = new HealthEndpoint(_config)
    this.secretaries = new SecretariesEndpoint(_config)
    this.serviceGroups = new ServiceGroupsEndpoint(_config)
    this.services = new ServicesEndpoint(_config)
    this.servicesAvailable = new ServicesAvailableEndpoint(_config)
    this.specialists = new SpecialistsEndpoint(_config)
    this.specializations = new SpecializationsEndpoint(_config)
    this.test = new TestEndpoint(_config)
  }
}
