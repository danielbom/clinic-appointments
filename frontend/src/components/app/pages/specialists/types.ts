export type Specialist = {
  id: string
  name: string
  email: string
  phone: string
  birthdate: string
  cpf: string
  cnpj: string
}

export type SpecialistSpecializationService = {
  id: string
  serviceNameId: string
  serviceName: string
  price: number
  duration: number
}

export type SpecialistSpecialization = {
  id: string
  name: string
  services: SpecialistSpecializationService[]
}

export type SpecialistAppointment = {
  id: string
  customerName: string
  customerId: string
  serviceName: string
  serviceId: string
  price: number
  duration: number
  date: string
  time: string
}
