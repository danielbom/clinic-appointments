package usecase

import (
	"github.com/jackc/pgx/v5/pgtype"
)

func DeleteCustomer(state State, id pgtype.UUID) *UsecaseError {
	count, err := state.Queries().DeleteCustomerByID(state.Context(), id)
	if err != nil {
		return NewUnexpectedError(err)
	}
	if count == 0 {
		return NewNotFoundError("customer")
	}
	return nil
}
