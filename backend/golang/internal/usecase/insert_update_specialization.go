package usecase

import (
	"strings"

	"backend/internal/infra"

	"github.com/jackc/pgx/v5/pgtype"
)

type SpecializationInfoArgs struct {
	Name string
}

func (args *SpecializationInfoArgs) Validate() *UsecaseError {
	args.Name = strings.TrimSpace(args.Name)
	if args.Name == "" {
		return NewInvalidArgumentError(ErrFieldIsRequired).InField("name")
	}
	return nil
}

func SpecializationWithNameExists(state State, name string, exceptId pgtype.UUID) (bool, error) {
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

func CreateSpecialization(state State, args SpecializationInfoArgs) (pgtype.UUID, *UsecaseError) {
	var none pgtype.UUID
	exists, err := SpecializationWithNameExists(state, args.Name, pgtype.UUID{})
	if err != nil {
		return none, NewUnexpectedError(err)
	}
	if exists {
		return none, NewResourceAlreadyExistsError("specialization.name")
	}

	id, err := NewUuid()
	if err != nil {
		return none, NewUnexpectedError(err)
	}

	_, err = state.Queries().CreateSpecialization(state.Context(), infra.CreateSpecializationParams{
		ID:   id,
		Name: args.Name,
	})
	if err != nil {
		return none, NewUnexpectedError(err)
	}
	return id, nil
}

func UpdateSpecialization(state State, specializationId pgtype.UUID, args SpecializationInfoArgs) (pgtype.UUID, *UsecaseError) {
	var none pgtype.UUID
	exists, err := SpecializationWithNameExists(state, args.Name, specializationId)
	if err != nil {
		return none, NewUnexpectedError(err)
	}
	if exists {
		return none, NewResourceAlreadyExistsError("specialization.name")
	}

	id, err := state.Queries().UpdateSpecialization(state.Context(), infra.UpdateSpecializationParams{
		ID:   specializationId,
		Name: args.Name,
	})
	if err != nil {
		return none, NewUnexpectedError(err)
	}
	return id, nil
}
