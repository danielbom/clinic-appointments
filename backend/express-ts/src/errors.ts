import * as types from './swagger-types'

const devUrl = 'https://dev-clinic-appointments.com.br'
export const errors = {
  missingValue(location: 'body' | 'path' | 'query', path = '') {
    return {
      code: 'validation_error' as const,
      type: `${devUrl}/schemas/errors/ValidationError.json`,
      title: 'Validation error',
      detail: `${path || location} is required`,
      status: 400 as const,
      source: {
        in: location,
        path: path || '/',
      },
    }
  },
  validation(location: 'body' | 'path' | 'query', path: string, reason: string) {
    if (reason === 'must NOT have fewer than 1 characters') {
      reason = 'is required'
    } else if (reason.startsWith('must be ')) {
      reason = 'is required'
    }
    return {
      code: 'validation_error' as const,
      type: `${devUrl}/schemas/errors/ValidationError.json`,
      title: 'Validation error',
      status: 400 as const,
      source: {
        in: location,
        path: path || '/',
      },
      errors: {
        [path || location]: [reason],
      },
    }
  },
  invalidState(detail: string) {
    return {
      code: 'validation_error' as const,
      type: `${devUrl}/schemas/errors/ValidationError.json`,
      title: 'Validation error',
      detail,
      status: 400 as const,
    }
  },
  ajv(error: { instancePath: string; message?: string | undefined }) {
    const instancePath = error.instancePath
    let reason = error.message ?? ''
    let key = ''
    if (instancePath) {
      key = instancePath.slice(1).replaceAll(/\//g, '.')
    }
    const match = reason.match(/'(\w+)'/)
    if (match) {
      key = match[1]
    }
    if (reason.startsWith('must have required property ')) {
      reason = 'is required'
    }
    if (!key) {
      return this.missingValue('body')
    }
    return this.validation('body', key, reason)
  },
  auth(type: 'invalid_credentials' | 'invalid_token') {
    let title = ''
    let detail = ''
    switch (type) {
      case 'invalid_credentials': {
        title = 'Invalid credentials'
        detail = 'Email or password is incorrect'
        break
      }
      case 'invalid_token': {
        title = 'Invalid token'
        detail = 'JWT token is invalid or expired'
        break
      }
    }
    return {
      code: 'auth_error' as const,
      type: `${devUrl}/schemas/errors/AuthError.json`,
      title,
      detail,
      status: 401 as const,
    }
  },
  invalidAccess(detail: string) {
    return {
      code: 'forbidden_error' as const,
      type: `${devUrl}/schemas/errors/ForbiddenError.json`,
      title: 'ForbiddenError',
      detail,
      status: 403 as const,
    }
  },
  notFound(resource: types.domain.Resource) {
    return {
      code: 'resource_not_found' as const,
      type: `${devUrl}/schemas/errors/ResourceNotFound.json`,
      title: 'Resource not found',
      detail: `${resource} not found`,
      status: 404 as const,
    }
  },
  alreadyExists(resource: types.domain.Resource, key: string) {
    return {
      code: 'resource_conflict' as const,
      type: `${devUrl}/schemas/errors/ResourceConflict.json`,
      title: 'Resource already exists',
      detail: `${resource} with this ${key} already exists`,
      status: 409 as const,
    }
  },
  internal(detail?: string) {
    return {
      code: 'internal_error' as const,
      type: `${devUrl}/schemas/errors/InternalError.json`,
      title: 'Internal error',
      detail,
      status: 500 as const,
    }
  },
}

{
  let typecheck: Record<string, (...args: any) => types.schemas.ProblemDetails> = errors
  typecheck
}
