package usecase

import "github.com/google/uuid"

func DeleteSpecialistService(state State, serviceID uuid.UUID) *UsecaseError {
	err := state.Queries().DeleteService(state.Context(), serviceID)
	if ErrorIsNoRows(err) {
		return NewNotFoundError(ErrResourceNotFound).InField("service")
	}
	if err != nil {
		return NewUnexpectedError(err)
	}
	return nil
}
