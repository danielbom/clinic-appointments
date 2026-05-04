package presenter

import (
	"fmt"

	"backend/internal/api/dtos"
)

type AuthProblemType int

const (
	AUTH_INVALID_CREDENTIALS = iota
	AUTH_INVALID_TOKEN
)

const DEV_URL = "https://dev-clinic-appointments.com.br"

func InvalidStateProblem(detail string) dtos.ProblemDetails {
	var p dtos.ProblemDetails
	p.Code = "validation_error"
	p.Type = fmt.Sprintf("%s/schemas/errors/ValidationError.json", DEV_URL)
	p.Title = "Validation error"
	p.Detail = detail
	p.Status = 400
	return p
}

func MissingValueProblem(location, path string) dtos.ProblemDetails {
	var p dtos.ProblemDetails
	p.Code = "validation_error"
	p.Type = fmt.Sprintf("%s/schemas/errors/ValidationError.json", DEV_URL)
	p.Title = "Validation error"
	p.Status = 400
	p.Source = new(dtos.ProblemSource)
	p.Source.In = location
	p.Source.Path = path
	return p
}

func ValidationProblem(location, path, reason string) dtos.ProblemDetails {
	p := MissingValueProblem(location, path)
	key := path
	if key != "/" {
		// p.Detail = fmt.Sprintf("%s %s", key, reason)
		errors := make([]string, 1)
		errors[0] = reason
		p.Errors = make(map[string][]string, 1)
		p.Errors[path] = errors
	} else {
		p.Detail = fmt.Sprintf("%s is required", location)
	}
	return p
}

func AuthProblem(authProblemType AuthProblemType) dtos.ProblemDetails {
	var title, detail string
	switch authProblemType {
	case AUTH_INVALID_CREDENTIALS:
		title = "Invalid credentials"
		detail = "Email or password is incorrect"
	case AUTH_INVALID_TOKEN:
		title = "Invalid token"
		detail = "JWT token is invalid or expired"
	}
	var p dtos.ProblemDetails
	p.Code = "auth_error"
	p.Type = fmt.Sprintf("%s/schemas/errors/AuthError.json", DEV_URL)
	p.Title = title
	p.Detail = detail
	p.Status = 401
	return p
}

func InvalidAccess(detail string) dtos.ProblemDetails {
	var p dtos.ProblemDetails
	p.Code = "forbidden_error"
	p.Type = fmt.Sprintf("%s/schemas/errors/ForbiddenError.json", DEV_URL)
	p.Title = "Forbidden error"
	p.Detail = detail
	p.Status = 403
	return p
}

func NotFoundProblem(resource string) dtos.ProblemDetails {
	var p dtos.ProblemDetails
	p.Code = "resource_not_found"
	p.Type = fmt.Sprintf("%s/schemas/errors/ResourceNotFound.json", DEV_URL)
	p.Title = "Resource not found"
	p.Detail = fmt.Sprintf("%s not found", resource)
	p.Status = 404
	return p
}

func RouteNotFoundProblem(method, url string) dtos.ProblemDetails {
	var p dtos.ProblemDetails
	p.Code = "resource_not_found"
	p.Type = fmt.Sprintf("%s/schemas/errors/ResourceNotFound.json", DEV_URL)
	p.Title = "Route not found"
	p.Detail = fmt.Sprintf("%s %s not found", method, url)
	p.Status = 404
	return p
}

func AlreadyExistsProblem(resource, key string) dtos.ProblemDetails {
	var p dtos.ProblemDetails
	p.Code = "resource_conflict"
	p.Type = fmt.Sprintf("%s/schemas/errors/ResourceConflict.json", DEV_URL)
	p.Title = "Resource conflict"
	p.Detail = fmt.Sprintf("%s with this %s already exists", resource, key)
	p.Status = 409
	return p
}

func InternalProblem(detail string) dtos.ProblemDetails {
	var p dtos.ProblemDetails
	p.Code = "internal_error"
	p.Type = fmt.Sprintf("%s/schemas/errors/InternalError.json", DEV_URL)
	p.Title = "Internal error"
	p.Detail = detail
	p.Status = 500
	return p
}
