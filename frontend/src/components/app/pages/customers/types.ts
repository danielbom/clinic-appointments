export type Customer = {
  id: string
  name: string
  email: string
  phone: string
  birthdate: string
  cpf: string
  addresses: Address[]
}

export type Address = {
  id: string
  street: string
  number: string
  city: string
  state: string
  zipCode: string
  country: string
}
