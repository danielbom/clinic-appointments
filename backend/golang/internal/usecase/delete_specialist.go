package usecase

import (
	"github.com/jackc/pgx/v5/pgtype"
)

func DeleteSpecialist(state State, id pgtype.UUID) *UsecaseError {
	count, err := state.Queries().DeleteSpecialistByID(state.Context(), id)
	if err != nil {
		return NewUnexpectedError(err)
	}
	if count == 0 {
		return NewNotFoundError("specialist")
	}
	return nil
}
