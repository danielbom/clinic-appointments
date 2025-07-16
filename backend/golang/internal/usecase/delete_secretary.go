package usecase

import (
	"github.com/google/uuid"
)

func DeleteSecretary(state State, id uuid.UUID) *UsecaseError {
	err := state.Queries().DeleteSecretaryByID(state.Context(), id)
	if err == nil {
		return nil
	}
	if ErrorIsNoRows(err) {
		return NewNotFoundError(ErrResourceNotFound).InField("secretary")
	}
	return NewUnexpectedError(err)
}
