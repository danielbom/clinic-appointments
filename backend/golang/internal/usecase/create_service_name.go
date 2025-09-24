package usecase

import (
	"backend/internal/domain"
	"backend/internal/infra"

	"github.com/google/uuid"
)

type CreateServiceNameArgs struct {
	Name                domain.String
	Specialization      domain.String
	SpecializationIDRaw string
	SpecializationID    domain.UUID
}

func (args *CreateServiceNameArgs) Validate() *UsecaseError {
	if !args.Specialization.IsDefined() && !args.SpecializationID.IsDefined() {
		if err := args.SpecializationID.Scan(args.SpecializationIDRaw); err != nil {
			return NewInvalidArgumentError(err).InField("specializationId")
		}
	}
	if err := args.Name.Required(); err != nil {
		return NewInvalidArgumentError(err).InField("name")
	}
	return nil
}

func ServiceWithNameExists(state State, name string, exceptId uuid.UUID) (bool, error) {
	service, err := state.Queries().GetServiceNameByName(state.Context(), name)
	if ErrorIsNoRows(err) {
		return false, nil
	}
	if err != nil {
		return false, err
	}
	if service.ID == exceptId {
		return false, nil
	}
	return true, nil
}

func CreateServiceName(state State, args CreateServiceNameArgs) (uuid.UUID, *UsecaseError) {
	exists, err := ServiceWithNameExists(state, args.Name.Value, uuid.Nil)
	if err != nil {
		return uuid.Nil, NewUnexpectedError(err)
	}
	if exists {
		return uuid.Nil, NewResourceAlreadyExistsError("service_name")
	}

	if args.Specialization.IsDefined() {
		specializationId, err := state.Queries().CreateSpecialization(state.Context(), args.Specialization.Value)
		if err != nil {
			return uuid.Nil, NewUnexpectedError(err)
		}
		args.SpecializationID.Value = specializationId
	}

	params := infra.CreateServiceNameParams{
		Name:             args.Name.Value,
		SpecializationID: args.SpecializationID.Value,
	}
	id, err := state.Queries().CreateServiceName(state.Context(), params)
	if err != nil {
		return uuid.Nil, NewUnexpectedError(err)
	}
	return id, nil
}
