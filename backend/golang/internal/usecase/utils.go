package usecase

import (
	"fmt"
	"time"

	"github.com/gofrs/uuid/v5"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/pkg/errors"
)

func DateFromYear(result *pgtype.Date, year int) error {
	return result.Scan(time.Date(year, 1, 1, 0, 0, 0, 0, time.UTC))
}

func DateFromString(result *pgtype.Date, strDate string) error {
	return DateFromISOString(result, strDate+"T00:00:00Z")
}

func DateFromISOString(result *pgtype.Date, isoDate string) error {
	var dateTime time.Time
	err := dateTime.UnmarshalText([]byte(isoDate))
	if err != nil {
		return err
	}
	return result.Scan(dateTime)
}

func TimeToString(time pgtype.Time) string {
	seconds := int32(time.Microseconds / 1000000)
	minutes := seconds / 60
	hours := minutes / 60
	return fmt.Sprintf("%02d:%02d:%02d", hours, minutes%60, seconds%60)
}

func ErrorIsNoRows(err error) bool {
	return errors.Is(err, pgx.ErrNoRows)
}

func NewUuid() (pgtype.UUID, error) {
	var none pgtype.UUID
	u, err := uuid.NewV7()
	if err != nil {
		return none, err
	}

	result := pgtype.UUID{
		Bytes: u,
		Valid: true,
	}
	return result, nil
}

func AppointmentStatusToString(status AppointmentStatus) string {
	switch status {
	case AppointmentStatusCanceled:
		return "Canceled"
	case AppointmentStatusPending:
		return "Pending"
	case AppointmentStatusRealized:
		return "Realized"
	}
	return "?"
}
