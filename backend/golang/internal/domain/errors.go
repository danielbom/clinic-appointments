package domain

import (
	"errors"
)

var ErrUnexpected = errors.New("unexpected")

var ErrIsRequired = errors.New("field is required")

var (
	ErrInvalidUuid = errors.New("invalid uuid")
	ErrInvalidDate = errors.New("invalid date")
	ErrInvalidTime = errors.New("invalid time")

	ErrInvalidInterval      = errors.New("invalid interval")
	ErrInvalidIntervalRange = errors.New("invalid interval range")

	ErrInvalidWeekday = errors.New("invalid weekday")

	ErrInvalidFormat = errors.New("invalid format")

	ErrExpectPositiveInteger = errors.New("expect positive interger")
	ErrExpectNegativeInteger = errors.New("expect negative interger")

	ErrInvalidAppointmentStatus = errors.New("invalid appointment status")
)
