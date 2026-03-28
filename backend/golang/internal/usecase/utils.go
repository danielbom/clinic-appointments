package usecase

import (
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/pkg/errors"
)

func IntervalToSeconds(internal pgtype.Interval) int32 {
	return int32(internal.Microseconds / 1000000)
}

func SecondsToInterval(sec int32) pgtype.Interval {
	return pgtype.Interval{
		Microseconds: int64(sec) * 1000000,
		Valid:        true,
	}
}

func MinutesToInterval(min int32) pgtype.Interval {
	return SecondsToInterval(min * 60)
}

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

func ErrorIsNoRows(err error) bool {
	return errors.Is(err, pgx.ErrNoRows)
}
