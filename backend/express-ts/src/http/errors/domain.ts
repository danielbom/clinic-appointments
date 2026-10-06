import type * as types from '../types'
import { errors } from './presenter'

export type InvalidCredentialsError = { kind: 'invalid credentials' }
export type InvalidTokenError = { kind: 'invalid token' }
export type NotFoundError = { kind: 'not found'; resource: types.core.Resource }
export type AlreadyExistsError = { kind: 'already exists'; resource: types.core.Resource; key: string }
export type IdempotencyKeyConflict = { kind: 'idempotency key conflict'; operation: string }
export type ScheduleConflictError = { kind: 'schedule conflict'; resource: types.core.Resource; key: string }
export type InvalidStateTransitionError = {
  kind: 'invalid state transition'
  resource: types.core.Resource
  from: string
  to: string
}
export type UnexpectedStateError = {
  kind: 'unexpected state'
  resource: types.core.Resource
  current: string
  expected: string
}
export type InternalError = { kind: 'internal'; detail: string }

type Errors =
  | { error: NotFoundError; response: types.errors.NotFoundProblemDetails }
  | { error: AlreadyExistsError; response: types.errors.ConflictProblemDetails }
  | { error: ScheduleConflictError; response: types.errors.ConflictProblemDetails }
  | { error: InvalidCredentialsError; response: types.errors.AuthProblemDetails }
  | { error: InvalidTokenError; response: types.errors.AuthProblemDetails }
  | { error: InvalidStateTransitionError; response: types.errors.ConflictProblemDetails }
  | { error: UnexpectedStateError; response: types.errors.ConflictProblemDetails }
  | { error: IdempotencyKeyConflict; response: types.errors.ConflictProblemDetails }
  | { error: InternalError; response: types.errors.InternalProblemDetails }

type ErrorsMap = {
  'not found': types.errors.NotFoundProblemDetails
  'already exists': types.errors.ConflictProblemDetails
  'schedule conflict': types.errors.ConflictProblemDetails
  'idempotency key conflict': types.errors.ConflictProblemDetails
  'invalid credentials': types.errors.AuthProblemDetails
  'invalid token': types.errors.AuthProblemDetails
  'internal': types.errors.AuthProblemDetails
  'invalid state transition': types.errors.ConflictProblemDetails
  'unexpected state': types.errors.ConflictProblemDetails
}

export function mapError<TError extends Errors['error'], K extends TError['kind']>(error: TError): ErrorsMap[K] {
  switch (error.kind) {
    case 'idempotency key conflict':
      return errors.idempotencyKeyConflict(error.operation) as ErrorsMap[K]
    case 'not found':
      return errors.notFound(error.resource) as ErrorsMap[K]
    case 'already exists':
      return errors.alreadyExists(error.resource, error.key) as ErrorsMap[K]
    case 'schedule conflict':
      return errors.scheduleConflict(error.resource, error.key) as ErrorsMap[K]
    case 'invalid state transition':
      return errors.invalidStateTransition(error.resource, error.from, error.to) as ErrorsMap[K]
    case 'unexpected state':
      return errors.unexpectedState(error.resource, error.current, error.expected) as ErrorsMap[K]
    case 'invalid credentials':
      return errors.invalidCredentials() as ErrorsMap[K]
    case 'invalid token':
      return errors.invalidToken() as ErrorsMap[K]
    case 'internal':
      return errors.internal(error.detail) as ErrorsMap[K]
  }
  throw new Error('unreachable')
}
