export const credentials = {
  admin: {
    email: 'admin@test.com',
    password: '123mudar',
  },
  secretary: {
    email: 'secretary@test.com',
    password: '456@Mudar',
  },
}

export const baseData = {
  secretary: {
    name: 'Secretary Test',
    ...credentials.secretary,
    birthdate: '2000-10-10',
    cnpj: '08130896000135',
    cpf: '72730805001',
    phone: '119876543210',
  },
  specialist: {
    name: 'Specialist Test',
    email: 'specialist@test.com',
    phone: '219876543210',
    cnpj: '16833374000128',
    cpf: '96156338012',
    birthdate: '1999-09-09',
    services: [],
  },
  customer: {
    name: 'Customer Test',
    email: 'customer@test.com',
    cpf: '11431287962',
    birthdate: '1999-08-08',
    phone: '21987654321',
  },
}
