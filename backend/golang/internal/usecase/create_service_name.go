package usecase

import (
	"strings"

	"backend/internal/infra"

	"github.com/jackc/pgx/v5/pgtype"
)

type CreateServiceNameArgs struct {
	Name                string
	Specialization      string
	SpecializationIDRaw string
	SpecializationID    pgtype.UUID
}

func (args *CreateServiceNameArgs) Validate() *UsecaseError {
	args.Name = strings.TrimSpace(args.Name)
	if args.Specialization == "" && !args.SpecializationID.Valid {
		if err := args.SpecializationID.Scan(args.SpecializationIDRaw); err != nil {
			return NewInvalidArgumentError(ErrInvalidUuid).InField("specializationId")
		}
	}
	if args.Name == "" {
		return NewInvalidArgumentError(ErrFieldIsRequired).InField("name")
	}
	return nil
}

func ServiceWithNameExists(state State, name string, exceptId pgtype.UUID) (bool, error) {
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

func CreateServiceName(state State, args CreateServiceNameArgs) (pgtype.UUID, *UsecaseError) {
	var none pgtype.UUID
	exists, err := ServiceWithNameExists(state, args.Name, none)
	if err != nil {
		return none, NewUnexpectedError(err)
	}
	if exists {
		return none, NewResourceAlreadyExistsError("service_name")
	}

	if args.Specialization != "" {
		id, err := NewUuid()
		if err != nil {
			return none, NewUnexpectedError(err)
		}

		params := infra.CreateSpecializationParams{
			ID:   id,
			Name: args.Specialization,
		}
		specializationId, err := state.Queries().CreateSpecialization(state.Context(), params)
		if err != nil {
			return none, NewUnexpectedError(err)
		}
		args.SpecializationID = specializationId
	}

	id, err := NewUuid()
	if err != nil {
		return none, NewUnexpectedError(err)
	}
	params := infra.CreateServiceNameParams{
		ID:               id,
		Name:             args.Name,
		SpecializationId: args.SpecializationID,
	}
	_, err = state.Queries().CreateServiceName(state.Context(), params)
	if err != nil {
		return none, NewUnexpectedError(err)
	}
	return id, nil
}
