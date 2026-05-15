import type * as types from './swagger-types'

const devUrl = 'https://dev-clinic-appointments.com.br'

export const errors = {
  missingValue(location: 'body' | 'path' | 'query', path = ''): types.errors.ValidationProblemDetails {
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
  validation(location: 'body' | 'path' | 'query', path: string, reason: string): types.errors.ValidationProblemDetails {
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
  invalidState(detail: string): types.errors.ValidationProblemDetails {
    return {
      code: 'validation_error' as const,
      type: `${devUrl}/schemas/errors/ValidationError.json`,
      title: 'Validation error',
      detail,
      status: 400 as const,
    }
  },
  ajv(error: { instancePath: string; message?: string | undefined }): types.errors.ValidationProblemDetails {
    const instancePath = error.instancePath
    let reason = error.message ?? ''
    let key = ''
    if (instancePath) {
      key = instancePath.slice(1).replaceAll(/\//g, '.')
    }
    const matchFormat = reason.match(/must match format \"(\w+)\"/)
    if (matchFormat) {
      reason = `invalid ${matchFormat[1]}`
    }
    const match = reason.match(/'(\w+)'/)
    if (match?.[1]) {
      key = match[1]
    }
    if (!key) {
      return this.missingValue('body')
    }
    if (reason.startsWith('must have required property ')) {
      reason = 'is required'
    }
    return this.validation('body', key, reason)
  },

  invalidCredentials(): types.errors.AuthProblemDetails {
    return {
      code: 'auth_error' as const,
      type: `${devUrl}/schemas/errors/AuthError.json`,
      title: 'Invalid credentials',
      detail: 'Email or password is incorrect',
      status: 401 as const,
    }
  },
  invalidToken(): types.errors.AuthProblemDetails {
    return {
      code: 'auth_error' as const,
      type: `${devUrl}/schemas/errors/AuthError.json`,
      title: 'Invalid token',
      detail: 'JWT token is invalid or expired',
      status: 401 as const,
    }
  },

  invalidAccess(detail: string): types.errors.InvalidAccessProblemDetails {
    return {
      code: 'forbidden_error' as const,
      type: `${devUrl}/schemas/errors/ForbiddenError.json`,
      title: 'Forbidden error',
      detail,
      status: 403 as const,
    }
  },

  notFound(resource: types.domain.Resource): types.errors.NotFoundProblemDetails {
    return {
      code: 'resource_not_found' as const,
      type: `${devUrl}/schemas/errors/ResourceNotFound.json`,
      title: 'Resource not found',
      detail: `${resource} not found`,
      status: 404 as const,
    }
  },
  routeNotFound(method: string, url: URL): types.errors.NotFoundProblemDetails {
    const fullUrl = url.toString()
    const urlStr = fullUrl.slice(fullUrl.indexOf(url.host) + url.host.length)
    return {
      code: 'resource_not_found' as const,
      type: `${devUrl}/schemas/errors/ResourceNotFound.json`,
      title: 'Route not found',
      detail: `${method} ${urlStr} not found`,
      status: 404 as const,
    }
  },

  alreadyExists(resource: types.domain.Resource, key: string): types.errors.ConflictProblemDetails {
    return {
      code: 'resource_conflict' as const,
      type: `${devUrl}/schemas/errors/ResourceConflict.json`,
      title: 'Resource conflict',
      detail: `${resource} with the same ${key} already exists`,
      status: 409 as const,
    }
  },

  scheduleConflict(resource: types.domain.Resource, key: string): types.errors.ConflictProblemDetails {
    return {
      code: 'resource_conflict' as const,
      type: `${devUrl}/schemas/errors/ResourceConflict.json`,
      title: 'Schedule conflict',
      detail: `${resource} already scheduled at the specified ${key}`,
      status: 409 as const,
    }
  },

  internal(detail?: string): types.errors.InternalProblemDetails {
    return {
      code: 'internal_error' as const,
      type: `${devUrl}/schemas/errors/InternalError.json`,
      title: 'Internal error',
      detail,
      status: 500 as const,
    }
  },
}
