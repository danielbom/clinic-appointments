package usecase

import (
	"backend/internal/infra"

	"github.com/jackc/pgx/v5/pgtype"
)

type UpdateServiceNameArgs struct {
	Name string
}

func (args *UpdateServiceNameArgs) Validate() *UsecaseError {
	if args.Name == "" {
		return NewInvalidArgumentError(ErrFieldIsRequired).InField("name")
	}
	return nil
}

func UpdateServiceName(state State, serviceId pgtype.UUID, args UpdateServiceNameArgs) (pgtype.UUID, *UsecaseError) {
	var none pgtype.UUID
	exists, err := ServiceWithNameExists(state, args.Name, serviceId)
	if err != nil {
		return none, NewUnexpectedError(err)
	}
	if exists {
		return none, NewResourceAlreadyExistsError("service_name")
	}

	params := infra.UpdateServiceNameParams{
		ID:   serviceId,
		Name: args.Name,
	}
	id, err := state.Queries().UpdateServiceName(state.Context(), params)
	if err != nil {
		return none, NewUnexpectedError(err)
	}
	return id, nil
}
