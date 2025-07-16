package usecase

import (
	"github.com/google/uuid"
)

func DeleteCustomer(state State, id uuid.UUID) *UsecaseError {
	err := state.Queries().DeleteCustomerByID(state.Context(), id)
	if err == nil {
		return nil
	}
	if ErrorIsNoRows(err) {
		return NewNotFoundError(ErrResourceNotFound).InField("customer")
	}
	return NewUnexpectedError(err)
}
