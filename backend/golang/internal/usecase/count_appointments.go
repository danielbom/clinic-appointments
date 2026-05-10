package usecase

import (
	"backend/internal/infra"

	"github.com/jackc/pgx/v5/pgtype"
)

type CountAppointmentsArgs struct {
	CustomerName   string
	ServiceName    string
	SpecialistName string
	StartDateRaw   string
	StartDate      pgtype.Date
	EndDateRaw     string
	EndDate        pgtype.Date
	Status         int32
}

func (args *CountAppointmentsArgs) Validate() *UsecaseError {
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
	return nil
}

func CountAppointments(state State, args CountAppointmentsArgs) (int32, *UsecaseError) {
	count, err := state.Queries().CountAppointments(state.Context(), infra.CountAppointmentsParams{
		StartDate:      args.StartDate,
		EndDate:        args.EndDate,
		CustomerName:   args.CustomerName,
		SpecialistName: args.SpecialistName,
		ServiceName:    args.ServiceName,
		Status:         args.Status,
	})
	if err == nil {
		return count, nil
	}
	return 0, NewUnexpectedError(err)
}
