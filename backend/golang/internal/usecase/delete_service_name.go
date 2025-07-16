package usecase

import (
	"github.com/google/uuid"
)

func DeleteServiceName(state State, id uuid.UUID) *UsecaseError {
	err := state.Queries().DeleteServiceNameByID(state.Context(), id)
	if err == nil {
		return nil
	}
	if ErrorIsNoRows(err) {
		return NewNotFoundError(ErrResourceNotFound).InField("service_name")
	}
	return NewUnexpectedError(err)
}
