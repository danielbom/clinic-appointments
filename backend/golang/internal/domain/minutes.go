package domain

import "github.com/jackc/pgx/v5/pgtype"

type Minutes int32

func (d Minutes) Validate() error {
	value := int32(d)
	if value <= 0 {
		return ErrExpectPositiveInteger
	}
	return nil
}

func (d Minutes) Interval() pgtype.Interval {
	return pgtype.Interval{
		Microseconds: int64(d) * 60 * 1000000,
		Valid:        true,
	}
}
