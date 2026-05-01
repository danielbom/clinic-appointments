package usecase

import (
	"backend/internal/infra"

	"github.com/jackc/pgx/v5/pgtype"
)

type ListAppointmentsCalendarArgs struct {
	Year         int
	StartDateRaw string
	StartDate    pgtype.Date
	EndDateRaw   string
	EndDate      pgtype.Date
}

func (args *ListAppointmentsCalendarArgs) Validate() *UsecaseError {
	if args.Year > 0 {
		if err := DateFromYear(&args.StartDate, args.Year); err != nil {
			return NewInvalidArgumentError(ACTION_QUERY, "startDate", ErrInvalidDate)
		}
		if err := args.EndDate.Scan(args.StartDate.Time.AddDate(1, 0, -1)); err != nil {
			return NewInvalidArgumentError(ACTION_QUERY, "endDate", ErrInvalidDate)
		}
	} else {
		if args.StartDateRaw != "" {
			if err := args.StartDate.Scan(args.StartDateRaw); err != nil {
				return NewInvalidArgumentError(ACTION_QUERY, "startDate", ErrInvalidDate)
			}
		}
		if args.EndDateRaw != "" {
			if err := args.EndDate.Scan(args.EndDateRaw); err != nil {
				return NewInvalidArgumentError(ACTION_QUERY, "endDate", ErrInvalidDate)
			}
		}
	}
	return nil
}

func ListAppointmentsCalendar(state State, args ListAppointmentsCalendarArgs) ([]infra.ListAppointmentsCalendarRow, *UsecaseError) {
	appointments, err := state.Queries().ListAppointmentsCalendar(state.Context(), infra.ListAppointmentsCalendarParams{
		StartDate: args.StartDate,
		EndDate:   args.EndDate,
	})
	if err == nil {
		return appointments, nil
	}
	return nil, NewUnexpectedError(err)
}
