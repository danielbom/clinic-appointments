package usecase

import (
	"github.com/jackc/pgx/v5/pgtype"
)

func DeleteSpecialistService(state State, serviceID pgtype.UUID) *UsecaseError {
	count, err := state.Queries().DeleteService(state.Context(), serviceID)
	if err != nil {
		return NewUnexpectedError(err)
	}
	if count == 0 {
		return NewNotFoundError("service")
	}
	return nil
}
