package domain

import (
	"github.com/google/uuid"
)

type UUID struct {
	Value uuid.UUID
}

func NewUUID(value uuid.UUID) UUID {
	return UUID{Value: value}
}

func (u *UUID) ScanOptional(raw string) error {
	if !u.IsDefined() {
		if raw == "" {
			return nil
		}
		if err := u.Value.Scan(raw); err != nil {
			return ErrInvalidUuid
		}
	}
	return nil
}

func (u *UUID) IsDefined() bool {
	return u.Value != uuid.Nil
}

func (u *UUID) Required() error {
	if !u.IsDefined() {
		return ErrIsRequired
	}
	return nil
}

func (u *UUID) Scan(src string) error {
	err := u.ScanOptional(src)
	if err != nil {
		return err
	}
	return u.Required()
}
