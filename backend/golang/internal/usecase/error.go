package usecase

import (
	"fmt"

	"github.com/pkg/errors"
)

type ActionType int

const (
	ACTION_QUERY = iota
	ACTION_MUTATION
)

type UsecaseErrorKind int32

const (
	ErrorKindUnexpected UsecaseErrorKind = iota
	ErrorKindNotFound
	ErrorKindAlreadyExists
	ErrorKindScheduleConflict
	ErrorKindInvalidArgument
	ErrorKindInvalidState
	ErrorKindAuth
)

type UsecaseError struct {
	Kind     UsecaseErrorKind
	Error    error
	Action   ActionType
	Resource string
	Detail   string
	Key      string
}

func NewUnexpectedError(err error) *UsecaseError {
	return &UsecaseError{Kind: ErrorKindUnexpected, Error: err}
}

func NewUnreachableError(detail string) *UsecaseError {
	err := fmt.Errorf("unreachable: %s", detail)
	return &UsecaseError{Kind: ErrorKindUnexpected, Error: err}
}

func NewNotFoundError(resource string) *UsecaseError {
	return &UsecaseError{Kind: ErrorKindNotFound, Error: ErrResourceNotFound, Resource: resource}
}

func NewInvalidArgumentError(action ActionType, key string, err error) *UsecaseError {
	return &UsecaseError{Kind: ErrorKindInvalidArgument, Error: err, Key: key, Action: action}
}

func NewResourceAlreadyExistsError(resource, key string) *UsecaseError {
	return &UsecaseError{Kind: ErrorKindAlreadyExists, Error: ErrResourceAlreadyExists, Resource: resource, Key: key}
}

func NewScheduleConflictError(resource, key string) *UsecaseError {
	return &UsecaseError{Kind: ErrorKindScheduleConflict, Error: ErrResourceAlreadyExists, Resource: resource, Key: key}
}

func NewInvalidStateError(err error) *UsecaseError {
	return &UsecaseError{Kind: ErrorKindInvalidState, Error: err}
}

func NewAuthError(err error) *UsecaseError {
	return &UsecaseError{Kind: ErrorKindAuth, Error: err}
}

var (
	ErrInvalidUuid     = errors.New("invalid uuid")
	ErrInvalidDate     = errors.New("invalid date")
	ErrInvalidTime     = errors.New("invalid time")
	ErrInvalidCpf      = errors.New("invalid cpf")
	ErrInvalidCnpj     = errors.New("invalid cnpj")
	ErrInvalidEmail    = errors.New("invalid email")
	ErrInvalidRange    = errors.New("invalid range")
	ErrInvalidPhone    = errors.New("invalid phone")
	ErrInvalidPattern  = errors.New("invalid pattern")
	ErrInvalidDuration = errors.New("invalid duration")

	ErrExpectPositiveValue = errors.New("expect positive value")
)

var (
	ErrFieldIsRequired = errors.New("is required")

	ErrInvalidAppointmentStatus = errors.New("invalid appointment status")

	ErrResourceNotFound      = errors.New("resource not found")
	ErrResourceAlreadyExists = errors.New("resource already exists")
)
