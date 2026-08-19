import * as queries from './queries'
import type { Res } from '../lib/res'
import type { NotFoundError } from '../http/errors/domain'
import { getDatePart, getTimePart } from './presenter'
import { Decimal } from '@prisma/client/runtime/client'

const APPOINTMENT_TAX_RATE = '0.1'
const APPOINTMENT_DISCOUNT_RATE = '0'

export function calculateInvoiceAmount__taxIncluded(chargedAmount: Decimal, discountAmount: Decimal, taxRate: Decimal) {
  const grossAmount = chargedAmount.minus(discountAmount)
  const taxAmount = grossAmount.times(taxRate).dividedBy(Decimal(1).plus(taxRate))
  const netAmount = grossAmount.minus(taxAmount)
  return { grossAmount, taxAmount, netAmount }
}

export function calculateInvoiceAmount__taxComputed(chargedAmount: Decimal, discountAmount: Decimal, taxRate: Decimal) {
  const grossAmount = chargedAmount
  const netBeforeTax = grossAmount.minus(discountAmount)
  const taxAmount = netBeforeTax.times(taxRate)
  const netAmount = netBeforeTax.plus(taxAmount)
  return { grossAmount, taxAmount, netAmount }
}

export function calculateInvoiceAmount(chargedAmount: Decimal, discountAmount: Decimal, taxRate: Decimal) {
  return calculateInvoiceAmount__taxIncluded(chargedAmount, discountAmount, taxRate)
}

function formatDecimalMoney(value: Decimal): string {
  return value.div(100).toFixed(2)
}

export async function prepareInvoice({
  specialistId,
  startDate,
  endDate,
}: {
  specialistId: string
  startDate: Date
  endDate: Date
}): Promise<Res<any, NotFoundError>> {
  const specialist = await queries.querySpecialist({ specialistId })
  if (!specialist) {
    return { ok: false, error: { kind: 'not found', resource: 'specialist' } }
  }

  const appointmentsRealized = await queries.querySpecialistAppointmentsRealized({
    specialistId,
    startDate,
    endDate,
  })

  const items = appointmentsRealized.map((it) => {
    const chargedAmount = Decimal(it.price)
    const discountAmount = Decimal(APPOINTMENT_DISCOUNT_RATE).times(chargedAmount)
    const taxRate = Decimal(APPOINTMENT_TAX_RATE)
    const { grossAmount, netAmount, taxAmount } = calculateInvoiceAmount(chargedAmount, discountAmount, taxRate)

    return {
      type: 'APPOINTMENT',
      description: `${it.service_names.name} às ${getTimePart(it.time.toISOString())} do dia ${getDatePart(it.date.toISOString())}`,
      note: `Serviço realizado para o cliente ${it.customers.name}`,
      quantity: 1,
      unitAmount: chargedAmount,
      chargedAmount,
      grossAmount,
      discountAmount,
      taxAmount,
      netAmount,
    }
  })

  const total = items.reduce(
    (partial, item) => {
      partial.chargedAmount = partial.chargedAmount.plus(item.chargedAmount)
      partial.grossAmount = partial.grossAmount.plus(item.grossAmount)
      partial.netAmount = partial.netAmount.plus(item.netAmount)
      partial.taxAmount = partial.taxAmount.plus(item.taxAmount)
      partial.discountAmount = partial.discountAmount.plus(item.discountAmount)
      partial.count[item.type] = (partial.count[item.type] || 0) + 1
      return partial
    },
    {
      chargedAmount: Decimal(0),
      grossAmount: Decimal(0),
      netAmount: Decimal(0),
      taxAmount: Decimal(0),
      discountAmount: Decimal(0),
      count: {} as Record<string, number>,
    },
  )

  return {
    ok: true,
    value: {
      specialist: {
        name: specialist.name,
        email: specialist.email,
        phone: specialist.phone,
        cnpj: specialist.cnpj,
      },
      total: {
        chargedAmount: formatDecimalMoney(total.chargedAmount),
        grossAmount: formatDecimalMoney(total.grossAmount),
        netAmount: formatDecimalMoney(total.netAmount),
        taxAmount: formatDecimalMoney(total.taxAmount),
        discountAmount: formatDecimalMoney(total.discountAmount),
      },
      count: total.count,
      billingPeriod: {
        startDate: getDatePart(startDate.toISOString()),
        endDate: getDatePart(endDate.toISOString()),
      },
      items: items.map((item) => ({
        ...item,
        unitAmount: formatDecimalMoney(item.unitAmount),
        chargedAmount: formatDecimalMoney(item.chargedAmount),
        grossAmount: formatDecimalMoney(item.grossAmount),
        netAmount: formatDecimalMoney(item.netAmount),
        taxAmount: formatDecimalMoney(item.taxAmount),
        discountAmount: formatDecimalMoney(item.discountAmount),
      })),
    },
  }
}
