import type * as types from './swagger-types'
import type * as mutations from './mutations'
import { errors } from './errors'

type Errors =
  | { error: mutations.NotFoundError; response: types.errors.NotFoundProblemDetails }
  | { error: mutations.AlreadyExistsError; response: types.errors.ConflictProblemDetails }
  | { error: mutations.ScheduleConflictError; response: types.errors.ConflictProblemDetails }
  | { error: mutations.InvalidCredentialsError; response: types.errors.AuthProblemDetails }
  | { error: mutations.InvalidTokenError; response: types.errors.AuthProblemDetails }
  | { error: mutations.InternalError; response: types.errors.InternalProblemDetails }

type ErrorsMap = {
  'not found': types.errors.NotFoundProblemDetails
  'already exists': types.errors.ConflictProblemDetails
  'schedule conflict': types.errors.ConflictProblemDetails
  'invalid credentials': types.errors.AuthProblemDetails
  'invalid token': types.errors.AuthProblemDetails
  'internal': types.errors.AuthProblemDetails
}

export function mapError<TError extends Errors['error'], K extends TError['kind']>(error: TError): ErrorsMap[K] {
  switch (error.kind) {
    case 'not found':
      return errors.notFound(error.resource) as ErrorsMap[K]
    case 'already exists':
      return errors.alreadyExists(error.resource, error.key) as ErrorsMap[K]
    case 'schedule conflict':
      return errors.scheduleConflict(error.resource, error.key) as ErrorsMap[K]
    case 'invalid credentials':
      return errors.invalidCredentials() as ErrorsMap[K]
    case 'invalid token':
      return errors.invalidToken() as ErrorsMap[K]
    case 'internal':
      return errors.internal(error.detail) as ErrorsMap[K]
  }
  throw new Error('unreachable')
}
