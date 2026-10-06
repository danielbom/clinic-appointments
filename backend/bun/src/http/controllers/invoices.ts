import { getJwtDataFromRequest, parseISODateToUTC } from '../../core/utils'
import * as usecases from '../../domain/usecases'
import { type RequestAdapter, replier } from '../../lib/http-adapter'
import { mapError } from '../errors/domain'
import { errors } from '../errors/presenter'
import type * as types from '../types'
import { validations } from '../validations'

export async function preview(req: RequestAdapter) {
  const reply = replier<types.api.invoices.preview.responses>(req)

  // Collect query parameters, path parameters, and request body
  const jwtData = await getJwtDataFromRequest(req)
  if (!jwtData) {
    return reply.fail(errors.invalidToken())
  }
  if (!jwtData.hasAccess('secretary')) {
    return reply.fail(errors.invalidAccess('Role without access'))
  }

  const body = await req.getJsonBody()
  const valid = validations.invoices.preview.body(body)
  if (!valid.ok) {
    return reply.fail(errors.ajv(valid.errors[0]))
  }
  const args: types.api.invoices.preview.body = valid.value

  // Validate and execute the usecase
  const specialistId = args.specialistId
  const startDate = parseISODateToUTC(args.startDate)!
  const endDate = parseISODateToUTC(args.endDate)!
  const result = await usecases.prepareInvoice({ specialistId, startDate, endDate })

  if (!result.ok) {
    return reply.fail(mapError(result.error))
  }

  // Format the response
  return reply.send(200, result.value)
}
