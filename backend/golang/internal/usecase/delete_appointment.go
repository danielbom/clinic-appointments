package usecase

import (
	"github.com/google/uuid"
)

func DeleteAppointment(state State, id uuid.UUID) *UsecaseError {
	err := state.Queries().DeleteAppointment(state.Context(), id)
	if err == nil {
		return nil
	}
	if ErrorIsNoRows(err) {
		return NewNotFoundError(ErrResourceNotFound).InField("appointment")
	}
	return NewUnexpectedError(err)
}
