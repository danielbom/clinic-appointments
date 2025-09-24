package usecase

import (
	"github.com/google/uuid"
)

func DeleteCustomer(state State, id uuid.UUID) *UsecaseError {
	count, err := state.Queries().DeleteCustomerByID(state.Context(), id)
	if err != nil {
		return NewError(ErrorKindUnexpected, err)
	}
	if count == 0 {
		return NewResourceNotFoundError("customer")
	}
	return nil
}
