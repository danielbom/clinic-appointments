export const specialistServicesIsRequired = {
  validator: (_: any, value: any[]) => {
    if (value && value.length < 1) {
      return Promise.reject('Especialista deve ter pelo menos 1 serviço disponível')
    }
    return Promise.resolve()
  },
  validateTrigger: 'onSubmit',
}
