package usecase

import (
	"backend/internal/infra"
)

type ListAppointmentsArgs struct {
	CountArgs      CountAppointmentsArgs
	PaginationArgs PaginationArgs
}

func (args *ListAppointmentsArgs) Validate() *UsecaseError {
	if err := args.CountArgs.Validate(); err != nil {
		return err
	}

	if err := args.PaginationArgs.Validate(); err != nil {
		return err
	}

	return nil
}

func ListAppointments(state State, args ListAppointmentsArgs) ([]infra.ListAppointmentsRow, *UsecaseError) {
	appointments, err := state.Queries().ListAppointments(state.Context(), infra.ListAppointmentsParams{
		StartDate:      args.CountArgs.StartDate.Value,
		EndDate:        args.CountArgs.EndDate.Value,
		CustomerName:   args.CountArgs.CustomerName,
		SpecialistName: args.CountArgs.SpecialistName,
		ServiceName:    args.CountArgs.ServiceName,
		Status:         args.CountArgs.Status,
		Limit:          int32(args.PaginationArgs.PageSize),
		Offset:         int32(args.PaginationArgs.PageSize) * int32(args.PaginationArgs.Page),
	})
	if err == nil {
		return appointments, nil
	}
	return nil, NewUnexpectedError(err)
}
