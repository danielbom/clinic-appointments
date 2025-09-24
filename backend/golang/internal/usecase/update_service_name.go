package usecase

import (
	"backend/internal/domain"
	"backend/internal/infra"

	"github.com/google/uuid"
)

type UpdateServiceNameArgs struct {
	Name domain.String
}

func (args *UpdateServiceNameArgs) Validate() *UsecaseError {
	if err := args.Name.Required(); err != nil {
		return NewInvalidArgumentError(err).InField("name")
	}
	return nil
}

func UpdateServiceName(state State, serviceId uuid.UUID, args UpdateServiceNameArgs) (uuid.UUID, *UsecaseError) {
	exists, err := ServiceWithNameExists(state, args.Name.Value, serviceId)
	if err != nil {
		return uuid.Nil, NewUnexpectedError(err)
	}
	if exists {
		return uuid.Nil, NewResourceAlreadyExistsError("service_name")
	}

	params := infra.UpdateServiceNameParams{
		ID:   serviceId,
		Name: args.Name.Value,
	}
	id, err := state.Queries().UpdateServiceName(state.Context(), params)
	if err != nil {
		return uuid.Nil, NewUnexpectedError(err)
	}
	return id, nil
}
