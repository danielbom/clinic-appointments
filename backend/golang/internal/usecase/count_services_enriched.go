package usecase

import (
	"backend/internal/infra"
)

type CountServicesEnrichedArgs struct {
	SpecialistName     string
	SpecializationName string
	ServiceName        string
}

func (args *CountServicesEnrichedArgs) Validate() *UsecaseError {
	return nil
}

func CountServicesEnriched(state State, args CountServicesEnrichedArgs) (int64, *UsecaseError) {
	count, err := state.Queries().CountServicesEnriched(state.Context(), infra.CountServicesEnrichedParams{
		Column1: args.SpecialistName,
		Column2: args.SpecializationName,
		Column3: args.ServiceName,
	})
	if err == nil {
		return count, nil
	}
	return 0, NewUnexpectedError(err)
}
