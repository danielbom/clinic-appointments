package usecase

import (
	"backend/internal/infra"

	"github.com/google/uuid"
)

func GetServiceAvailable(state State, id uuid.UUID) (infra.GetServiceAvailableByIDRow, *UsecaseError) {
	service, err := state.Queries().GetServiceAvailableByID(state.Context(), id)
	if err == nil {
		return service, nil
	}
	if ErrorIsNoRows(err) {
		return service, NewResourceNotFoundError("service")
	}
	return service, NewUnexpectedError(err)
}
