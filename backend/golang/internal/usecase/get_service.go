package usecase

import (
	"backend/internal/infra"

	"github.com/jackc/pgx/v5/pgtype"
)

func GetService(state State, id pgtype.UUID) (infra.Service, *UsecaseError) {
	service, err := state.Queries().GetServiceByID(state.Context(), id)
	if err == nil {
		return service, nil
	}
	if ErrorIsNoRows(err) {
		return service, NewNotFoundError(ErrResourceNotFound).InField("service")
	}
	return service, NewUnexpectedError(err)
}
