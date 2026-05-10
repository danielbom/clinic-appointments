package usecase

import (
	"github.com/jackc/pgx/v5/pgtype"
)

func DeleteSecretary(state State, id pgtype.UUID) *UsecaseError {
	count, err := state.Queries().DeleteSecretaryByID(state.Context(), id)
	if err != nil {
		return NewUnexpectedError(err)
	}
	if count == 0 {
		return NewNotFoundError("secretary")
	}
	return nil
}
