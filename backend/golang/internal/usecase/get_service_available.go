package usecase

import (
	"backend/internal/infra"

	"github.com/jackc/pgx/v5/pgtype"
)

func GetServiceAvailable(state State, id pgtype.UUID) (infra.GetServiceAvailableByIDRow, *UsecaseError) {
	service, err := state.Queries().GetServiceAvailableByID(state.Context(), id)
	if err == nil {
		return service, nil
	}
	if ErrorIsNoRows(err) {
		return service, NewNotFoundError("service_name")
	}
	return service, NewUnexpectedError(err)
}
