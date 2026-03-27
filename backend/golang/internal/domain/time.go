package domain

import "github.com/jackc/pgx/v5/pgtype"

type Time struct {
	Value pgtype.Time
}

const SECOND int64 = 1_000_000
const MINUTE int64 = SECOND * 60
const HOUR int64 = MINUTE * 60

func (d *Time) Scan(raw string) error {
	if !d.IsDefined() {
		if err := d.Value.Scan(raw); err != nil {
			return ErrInvalidTime
		}
	}
	return nil
}

func (u *Time) IsDefined() bool {
	return u.Value.Valid
}

func (u *Time) Seconds() int {
	return int(u.Value.Microseconds / SECOND % 60)
}

func (u *Time) Minutes() int {
	return int(u.Value.Microseconds / MINUTE % 60)
}

func (u *Time) Hour() int {
	return int(u.Value.Microseconds / HOUR)
}

func (lu Time) IsBefore(ru Time) bool {
	return lu.Value.Microseconds <= ru.Value.Microseconds
}

func (lu Time) IsAfter(ru Time) bool {
	return lu.Value.Microseconds >= ru.Value.Microseconds
}
