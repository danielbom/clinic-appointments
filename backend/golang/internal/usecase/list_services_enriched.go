package usecase

import (
	"backend/internal/infra"
)

type ListServicesEnrichedArgs struct {
	SpecialistName     string
	SpecializationName string
	ServiceName        string
	PaginationArgs     PaginationArgs
}

func (args *ListServicesEnrichedArgs) Validate() *UsecaseError {
	if err := args.PaginationArgs.Validate(); err != nil {
		return err
	}
	return nil
}

func ListServicesEnriched(state State, args ListServicesEnrichedArgs) ([]infra.ListServicesEnrichedRow, *UsecaseError) {
	services, err := state.Queries().ListServicesEnriched(state.Context(), infra.ListServicesEnrichedParams{
		Limit:          int32(args.PaginationArgs.PageSize),
		Offset:         int32(args.PaginationArgs.Page) * int32(args.PaginationArgs.PageSize),
		Specialist:     args.SpecialistName,
		Specialization: args.SpecializationName,
		ServiceName:    args.ServiceName,
	})
	if err != nil {
		return nil, NewUnexpectedError(err)
	}
	return services, nil
}
