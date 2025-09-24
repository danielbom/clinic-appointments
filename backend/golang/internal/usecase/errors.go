package usecase

import (
	"fmt"

	"github.com/pkg/errors"
)

type UsecaseErrorKind int32

const (
	ErrorKindUnexpected UsecaseErrorKind = iota
	ErrorKindInvalidArgument
	ErrorKindNotFound
	ErrorKindAlreadyExists
	ErrorKindInvalidState
	ErrorKindAuth
)

type UsecaseError struct {
	Error error
	Kind  UsecaseErrorKind
}

func NewError(kind UsecaseErrorKind, err error) *UsecaseError {
	return &UsecaseError{Kind: kind, Error: err}
}

func NewUnexpectedError(err error) *UsecaseError {
	return NewError(ErrorKindUnexpected, err)
}

func NewInvalidArgumentError(err error) *UsecaseError {
	return NewError(ErrorKindInvalidArgument, err)
}

func NewResourceNotFoundError(resource string) *UsecaseError {
	return NewError(ErrorKindNotFound, ErrResourceNotFound).InField(resource)
}

func NewResourceAlreadyExistsError(resource string) *UsecaseError {
	return NewError(ErrorKindAlreadyExists, ErrResourceAlreadyExists).InField(resource)
}

func NewInvalidStateError(err error) *UsecaseError {
	return NewError(ErrorKindInvalidState, err)
}

func NewAuthError(err error) *UsecaseError {
	return NewError(ErrorKindAuth, err)
}

func (e *UsecaseError) InField(field string) *UsecaseError {
	e.Error = fmt.Errorf("%s: %w", field, e.Error)
	return e
}

var (
	ErrUnreachable = errors.New("unreachable")

	ErrAppointmentsIntersection = errors.New("appointments intersection")

	ErrResourceNotFound      = errors.New("resource not found")
	ErrResourceAlreadyExists = errors.New("resource already exists")
)
