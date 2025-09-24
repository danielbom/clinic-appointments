package domain

import (
	"strings"

	"backend/internal/validate"

	"github.com/jackc/pgx/v5/pgtype"
)

type String struct {
	Value string
}

func StringNew(value string) String {
	return String{Value: strings.Trim(value, " ")}
}

func (s *String) IsDefined() bool {
	return len(s.Value) > 0
}

func (s *String) Required() error {
	if s.IsDefined() {
		return nil
	}
	return ErrIsRequired
}

func (s String) Text() pgtype.Text {
	return pgtype.Text{String: s.Value, Valid: true}
}

func (s String) String() string {
	return s.Value
}

func (s String) IsCpf() error {
	if !validate.IsCpfValid(s.Value) {
		return ErrInvalidFormat
	}
	return nil
}

func (s String) IsCnpj() error {
	if !validate.IsCnpjValid(s.Value) {
		return ErrInvalidFormat
	}
	return nil
}

func (s String) IsPassword() error {
	if !validate.IsPasswordValid(s.Value) {
		return ErrInvalidFormat
	}
	return nil
}
