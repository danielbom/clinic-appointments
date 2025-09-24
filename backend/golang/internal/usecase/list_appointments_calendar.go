package usecase

import (
	"backend/internal/domain"
	"backend/internal/infra"
)

type ListAppointmentsCalendarArgs struct {
	Year         int
	StartDateRaw string
	StartDate    domain.Date
	EndDateRaw   string
	EndDate      domain.Date
}

func (args *ListAppointmentsCalendarArgs) Validate() *UsecaseError {
	if args.Year > 0 {
		if err := args.StartDate.FirstDateOfYear(args.Year); err != nil {
			return NewInvalidArgumentError(err).InField("startDate")
		}
		if err := args.EndDate.LastDateOfYear(args.Year); err != nil {
			return NewInvalidArgumentError(err).InField("endDate")
		}
	} else {
		if err := args.StartDate.ScanOptional(args.StartDateRaw); err != nil {
			return NewInvalidArgumentError(err).InField("startDate")
		}
		if err := args.EndDate.ScanOptional(args.EndDateRaw); err != nil {
			return NewInvalidArgumentError(err).InField("endDate")
		}
	}
	return nil
}

func ListAppointmentsCalendar(state State, args ListAppointmentsCalendarArgs) ([]infra.ListAppointmentsCalendarRow, *UsecaseError) {
	appointments, err := state.Queries().ListAppointmentsCalendar(state.Context(), infra.ListAppointmentsCalendarParams{
		Date:   args.StartDate.Value,
		Date_2: args.EndDate.Value,
	})
	if err == nil {
		return appointments, nil
	}
	return nil, NewUnexpectedError(err)
}
