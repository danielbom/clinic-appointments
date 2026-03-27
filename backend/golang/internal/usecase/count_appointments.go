package usecase

import (
	"backend/internal/domain"
	"backend/internal/infra"
)

type CountAppointmentsArgs struct {
	CustomerName   string
	ServiceName    string
	SpecialistName string
	StartDateRaw   string
	StartDate      domain.Date
	EndDateRaw     string
	EndDate        domain.Date
	Status         int32
}

func (args *CountAppointmentsArgs) Validate() *UsecaseError {
	if err := args.StartDate.ScanOptional(args.StartDateRaw); err != nil {
		return NewInvalidArgumentError(err).InField("startDate")
	}
	if err := args.EndDate.ScanOptional(args.EndDateRaw); err != nil {
		return NewInvalidArgumentError(err).InField("endDate")
	}
	return nil
}

func CountAppointments(state State, args CountAppointmentsArgs) (int32, *UsecaseError) {
	count, err := state.Queries().CountAppointments(state.Context(), infra.CountAppointmentsParams{
		StartDate:      args.StartDate.Value,
		EndDate:        args.EndDate.Value,
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
