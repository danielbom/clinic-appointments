package domain

import "github.com/jackc/pgx/v5/pgtype"

type TimeInterval struct {
	Start Time
	End   Time
}

func (i *TimeInterval) StartTime() pgtype.Time {
	return i.Start.Value
}

func (i *TimeInterval) EndTime() pgtype.Time {
	return i.End.Value
}

func (i *TimeInterval) ScanStart(raw string) error {
	if !i.Start.IsDefined() {
		if err := i.Start.Value.Scan(raw); err != nil {
			return ErrInvalidTime
		}
	}
	return nil
}

func (i *TimeInterval) ScanEnd(raw string) error {
	if !i.End.IsDefined() {
		if err := i.End.Value.Scan(raw); err != nil {
			return ErrInvalidTime
		}
	}
	return nil
}

func (i *TimeInterval) Validate() error {
	if !i.Start.IsDefined() || !i.End.IsDefined() {
		return ErrInvalidInterval
	}
	if i.Start.IsAfter(i.End) {
		return ErrInvalidIntervalRange
	}
	return nil
}
