package domain

import (
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
)

type Date struct {
	Value pgtype.Date
}

func (u *Date) IsDefined() bool {
	return u.Value.Valid
}

func (d *Date) ScanOptional(raw string) error {
	if !d.IsDefined() {
		if raw == "" {
			return nil
		}
		if err := d.Value.Scan(raw); err != nil {
			return ErrInvalidUuid
		}
	}
	return nil
}

func (d *Date) Required() error {
	if !d.IsDefined() {
		return ErrIsRequired
	}
	return nil
}

func (d *Date) Scan(raw string) error {
	if !d.IsDefined() {
		if err := d.Value.Scan(raw); err != nil {
			return ErrInvalidDate
		}
	}
	return d.Required()
}

func (d *Date) FirstDateOfYear(year int) error {
	if !d.IsDefined() {
		if err := d.Value.Scan(time.Date(year, 1, 1, 0, 0, 0, 0, time.UTC)); err != nil {
			return fmt.Errorf("unexpected %w: %v", ErrInvalidDate, err)
		}
	}
	return d.Required()
}

func (d Date) LastDateOfYear(year int) error {
	if !d.IsDefined() {
		if err := d.Value.Scan(time.Date(year, 12, 31, 0, 0, 0, 0, time.UTC)); err != nil {
			return fmt.Errorf("unexpected %w: %v", ErrInvalidDate, err)
		}
	}
	return d.Required()
}
