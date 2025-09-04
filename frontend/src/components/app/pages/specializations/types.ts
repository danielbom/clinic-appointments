export type Service = {
  id: string
  name: string
}

export type Specialization = {
  id: string
  name: string
  services: Service[]
}
