package usecase

import (
	"github.com/google/uuid"
)

func DeleteSpecialist(state State, id uuid.UUID) *UsecaseError {
	err := state.Queries().DeleteSpecialistByID(state.Context(), id)
	if err == nil {
		return nil
	}
	if ErrorIsNoRows(err) {
		return NewNotFoundError(ErrResourceNotFound).InField("specialist")
	}
	return NewError(ErrorKindUnexpected, err)
}
