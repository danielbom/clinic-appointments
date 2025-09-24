package usecase

import (
	"backend/internal/domain"
	"backend/internal/infra"

	"github.com/google/uuid"
)

type SpecializationInfoArgs struct {
	Name domain.String
}

func (args *SpecializationInfoArgs) Validate() *UsecaseError {
	if err := args.Name.Required(); err != nil {
		return NewInvalidArgumentError(err).InField("name")
	}
	return nil
}

func SpecializationWithNameExists(state State, name string, exceptId uuid.UUID) (bool, error) {
	specialization, err := state.Queries().GetSpecializationByName(state.Context(), name)
	if ErrorIsNoRows(err) {
		return false, nil
	}
	if err != nil {
		return false, err
	}
	if specialization.ID == exceptId {
		return false, nil
	}
	return true, nil
}

func CreateSpecialization(state State, args SpecializationInfoArgs) (uuid.UUID, *UsecaseError) {
	exists, err := SpecializationWithNameExists(state, args.Name.Value, uuid.Nil)
	if err != nil {
		return uuid.Nil, NewUnexpectedError(err)
	}
	if exists {
		return uuid.Nil, NewResourceAlreadyExistsError("specialization.name")
	}

	id, err := state.Queries().CreateSpecialization(state.Context(), args.Name.Value)
	if err != nil {
		return uuid.Nil, NewUnexpectedError(err)
	}
	return id, nil
}

func UpdateSpecialization(state State, specializationId uuid.UUID, args SpecializationInfoArgs) (uuid.UUID, *UsecaseError) {
	exists, err := SpecializationWithNameExists(state, args.Name.Value, specializationId)
	if err != nil {
		return uuid.Nil, NewUnexpectedError(err)
	}
	if exists {
		return uuid.Nil, NewResourceAlreadyExistsError("specialization.name")
	}

	id, err := state.Queries().UpdateSpecialization(state.Context(), infra.UpdateSpecializationParams{
		ID:   specializationId,
		Name: args.Name.Value,
	})
	if err != nil {
		return uuid.Nil, NewUnexpectedError(err)
	}
	return id, nil
}
