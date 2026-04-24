package usecase

import (
	"backend/internal/infra"

	"github.com/jackc/pgx/v5/pgtype"
)

func GetSpecialistService(state State, specialistId, serviceNameId pgtype.UUID) (infra.Service, *UsecaseError) {
	service, err := state.Queries().GetService(state.Context(), infra.GetServiceParams{
		SpecialistId:  specialistId,
		ServiceNameId: serviceNameId,
	})
	if err == nil {
		return service, nil
	}
	if ErrorIsNoRows(err) {
		return service, NewNotFoundError(ErrResourceNotFound).InField("service")
	}
	return service, NewUnexpectedError(err)
}
