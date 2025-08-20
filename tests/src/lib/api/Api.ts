import { Config } from "./Config"
import { AppointmentsEndpoint } from "./endpoints/AppointmentsEndpoint"
import { AuthEndpoint } from "./endpoints/AuthEndpoint"
import { CustomersEndpoint } from "./endpoints/CustomersEndpoint"
import { HealthEndpoint } from "./endpoints/HealthEndpoint"
import { SecretariesEndpoint } from "./endpoints/SecretariesEndpoint"
import { ServiceGroupsEndpoint } from "./endpoints/ServiceGroupsEndpoint"
import { ServicesAvailableEndpoint } from "./endpoints/ServicesAvailableEndpoint"
import { ServicesEndpoint } from "./endpoints/ServicesEndpoint"
import { SpecialistsEndpoint } from "./endpoints/SpecialistsEndpoint"
import { SpecializationsEndpoint } from "./endpoints/SpecializationsEndpoint"
import { TestEndpoint } from "./endpoints/TestEndpoint"

export class Api {
  public appointments: AppointmentsEndpoint
  public auth: AuthEndpoint
  public customers: CustomersEndpoint
  public health: HealthEndpoint
  public secretaries: SecretariesEndpoint
  public serviceGroups: ServiceGroupsEndpoint
  public servicesAvailable: ServicesAvailableEndpoint
  public services: ServicesEndpoint
  public specialists: SpecialistsEndpoint
  public specializations: SpecializationsEndpoint
  public test: TestEndpoint

  constructor(public config: Config) {
    this.appointments = new AppointmentsEndpoint(config)
    this.auth = new AuthEndpoint(config)
    this.customers = new CustomersEndpoint(config)
    this.health = new HealthEndpoint(config)
    this.secretaries = new SecretariesEndpoint(config)
    this.serviceGroups = new ServiceGroupsEndpoint(config)
    this.servicesAvailable = new ServicesAvailableEndpoint(config)
    this.services = new ServicesEndpoint(config)
    this.specialists = new SpecialistsEndpoint(config)
    this.specializations = new SpecializationsEndpoint(config)
    this.test = new TestEndpoint(config)
  }
}
