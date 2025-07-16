const formatter = new Intl.NumberFormat('pt-BR')

export default function renderMoney(valueCents: number, prefix = 'R$ '): string {
  const cents = valueCents % 100
  const integer = (valueCents - cents) / 100
  return `${prefix}${formatter.format(integer)},${cents.toString().padStart(2, '0')}`
}
