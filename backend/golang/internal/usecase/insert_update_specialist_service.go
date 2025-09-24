package usecase

import (
	"backend/internal/domain"
	"backend/internal/infra"

	"github.com/google/uuid"
)

type SpecialistServiceInfoArgs struct {
	ServiceNameIDRaw  string
	ServiceNameID     domain.UUID
	SpecialistIDRaw   string
	SpecialistID      domain.UUID
	Price             domain.Nat
	Duration          domain.Minutes
	RequireSpecialist bool
}

func (args *SpecialistServiceInfoArgs) Validate() *UsecaseError {
	if err := args.ServiceNameID.Scan(args.ServiceNameIDRaw); err != nil {
		return NewInvalidArgumentError(err).InField("serviceNameId")
	}
	if args.RequireSpecialist && !args.SpecialistID.IsDefined() {
		if err := args.SpecialistID.Scan(args.SpecialistIDRaw); err != nil {
			return NewInvalidArgumentError(err).InField("specialistId")
		}
	}
	if err := args.Duration.Validate(); err != nil {
		return NewInvalidArgumentError(err).InField("duration")
	}
	if err := args.Price.Validate(); err != nil {
		return NewInvalidArgumentError(err).InField("price")
	}
	return nil
}

func CreateSpecialistService(state State, args SpecialistServiceInfoArgs) (uuid.UUID, *UsecaseError) {
	_, err := state.Queries().GetService(state.Context(), infra.GetServiceParams{
		SpecialistID:  args.SpecialistID.Value,
		ServiceNameID: args.ServiceNameID.Value,
	})
	if err == nil {
		return uuid.Nil, NewResourceAlreadyExistsError("service")
	} else if !ErrorIsNoRows(err) {
		return uuid.Nil, NewUnexpectedError(err)
	}

	id, err := state.Queries().CreateService(state.Context(), infra.CreateServiceParams{
		ServiceNameID: args.ServiceNameID.Value,
		SpecialistID:  args.SpecialistID.Value,
		Price:         int32(args.Price),
		Duration:      args.Duration.Interval(),
	})
	if err != nil {
		return uuid.Nil, NewUnexpectedError(err)
	}
	return id, nil
}

func UpdateSpecialistService(state State, serviceId uuid.UUID, args SpecialistServiceInfoArgs) (uuid.UUID, *UsecaseError) {
	params := infra.UpdateServiceParams{
		ID:       serviceId,
		Price:    int32(args.Price),
		Duration: args.Duration.Interval(),
	}
	id, err := state.Queries().UpdateService(state.Context(), params)
	if err != nil {
		return uuid.Nil, NewUnexpectedError(err)
	}
	return id, nil
}
