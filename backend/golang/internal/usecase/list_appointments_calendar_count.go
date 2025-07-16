package usecase

import (
	"backend/internal/infra"

	"github.com/jackc/pgx/v5/pgtype"
)

type ListAppointmentsCalendarCountArgs struct {
	Year         int
	StartDateRaw string
	StartDate    pgtype.Date
	EndDateRaw   string
	EndDate      pgtype.Date
}

func (args *ListAppointmentsCalendarCountArgs) Validate() *UsecaseError {
	if args.Year > 0 {
		if err := DateFromYear(&args.StartDate, args.Year); err != nil {
			return NewInvalidArgumentError(ErrInvalidDate).InField("startDate")
		}
		if err := args.EndDate.Scan(args.StartDate.Time.AddDate(1, 0, -1)); err != nil {
			return NewInvalidArgumentError(ErrInvalidDate).InField("endDate")
		}
	} else {
		if args.StartDateRaw != "" {
			if err := args.StartDate.Scan(args.StartDateRaw); err != nil {
				return NewInvalidArgumentError(ErrInvalidDate).InField("startDate")
			}
		}
		if args.EndDateRaw != "" {
			if err := args.EndDate.Scan(args.EndDateRaw); err != nil {
				return NewInvalidArgumentError(ErrInvalidDate).InField("endDate")
			}
		}
	}
	return nil
}

func ListAppointmentsCalendarCount(state State, args ListAppointmentsCalendarCountArgs) ([]infra.ListAppointmentsCalendarCountRow, *UsecaseError) {
	appointments, err := state.Queries().ListAppointmentsCalendarCount(state.Context(), infra.ListAppointmentsCalendarCountParams{
		Date:   args.StartDate,
		Date_2: args.EndDate,
	})
	if err == nil {
		return appointments, nil
	}
	return nil, NewUnexpectedError(err)
}
