package usecase

import (
	"backend/internal/infra"

	"github.com/jackc/pgx/v5/pgtype"
)

type SpecialistServiceInfoArgs struct {
	ServiceNameIDRaw  string
	ServiceNameID     pgtype.UUID
	SpecialistIDRaw   string
	SpecialistID      pgtype.UUID
	Price             int32
	DurationMin       int32
	RequireSpecialist bool
}

func (args *SpecialistServiceInfoArgs) Validate() *UsecaseError {
	if !args.ServiceNameID.Valid {
		if args.ServiceNameIDRaw == "" {
			return NewInvalidArgumentError(ACTION_MUTATION, "serviceNameId", ErrInvalidUuid)
		}
		if err := args.ServiceNameID.Scan(args.ServiceNameIDRaw); err != nil {
			return NewInvalidArgumentError(ACTION_MUTATION, "serviceNameId", ErrInvalidUuid)
		}
	}
	if args.RequireSpecialist && !args.SpecialistID.Valid {
		if args.SpecialistIDRaw == "" {
			return NewInvalidArgumentError(ACTION_MUTATION, "specialistId", ErrInvalidUuid)
		}
		if err := args.SpecialistID.Scan(args.SpecialistIDRaw); err != nil {
			return NewInvalidArgumentError(ACTION_MUTATION, "specialistId", ErrInvalidUuid)
		}
	}
	if args.DurationMin <= 0 {
		return NewInvalidArgumentError(ACTION_MUTATION, "duration", ErrExpectPositiveValue)
	}
	if args.Price < 0 {
		return NewInvalidArgumentError(ACTION_MUTATION, "price", ErrExpectPositiveValue)
	}
	return nil
}

func CreateSpecialistService(state State, args SpecialistServiceInfoArgs) (pgtype.UUID, *UsecaseError) {
	var none pgtype.UUID
	_, err := state.Queries().GetService(state.Context(), infra.GetServiceParams{
		SpecialistId:  args.SpecialistID,
		ServiceNameId: args.ServiceNameID,
	})
	if err == nil {
		return none, NewResourceAlreadyExistsError("service", "specialistId,serviceNameId")
	} else if !ErrorIsNoRows(err) {
		return none, NewUnexpectedError(err)
	}

	id, err := NewUuid()
	if err != nil {
		return none, NewUnexpectedError(err)
	}

	_, err = state.Queries().CreateService(state.Context(), infra.CreateServiceParams{
		ID:            id,
		ServiceNameId: args.ServiceNameID,
		SpecialistId:  args.SpecialistID,
		Price:         args.Price,
		Duration:      args.DurationMin,
	})
	if err != nil {
		return none, NewUnexpectedError(err)
	}
	return id, nil
}

func UpdateSpecialistService(state State, serviceId pgtype.UUID, args SpecialistServiceInfoArgs) (pgtype.UUID, *UsecaseError) {
	params := infra.UpdateServiceParams{
		ID:       serviceId,
		Price:    args.Price,
		Duration: args.DurationMin,
	}
	id, err := state.Queries().UpdateService(state.Context(), params)
	if err != nil {
		return id, NewUnexpectedError(err)
	}
	return id, nil
}
