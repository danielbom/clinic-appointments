package usecase

import (
	"backend/internal/infra"
)

type ListSpecialistsArgs struct {
	PaginationArgs PaginationArgs
	CountArgs      CountSpecialistArgs
}

func (args *ListSpecialistsArgs) Validate() *UsecaseError {
	if err := args.CountArgs.Validate(); err != nil {
		return err
	}
	if err := args.PaginationArgs.Validate(); err != nil {
		return err
	}
	return nil
}

func ListSpecialists(state State, args ListSpecialistsArgs) ([]infra.Specialist, *UsecaseError) {
	specializations, err := state.Queries().ListSpecialists(state.Context(), infra.ListSpecialistsParams{
		Limit:  int32(args.PaginationArgs.PageSize),
		Offset: int32(args.PaginationArgs.Page) * int32(args.PaginationArgs.PageSize),
	})
	if err != nil {
		return nil, NewUnexpectedError(err)
	}
	return specializations, nil
}
