package usecase

import (
	"github.com/google/uuid"
)

func DeleteSpecialization(state State, id uuid.UUID) *UsecaseError {
	err := state.Queries().DeleteSpecializationByID(state.Context(), id)
	if err == nil {
		return nil
	}
	if ErrorIsNoRows(err) {
		return NewNotFoundError(ErrResourceNotFound).InField("specialization")
	}
	return NewUnexpectedError(err)
}
