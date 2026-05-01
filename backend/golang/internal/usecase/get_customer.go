package usecase

import (
	"backend/internal/infra"

	"github.com/jackc/pgx/v5/pgtype"
)

func GetCustomer(state State, id pgtype.UUID) (infra.Customer, *UsecaseError) {
	customer, err := state.Queries().GetCustomerByID(state.Context(), id)
	if err == nil {
		return customer, nil
	}
	if ErrorIsNoRows(err) {
		return customer, NewNotFoundError("customer")
	}
	return customer, NewUnexpectedError(err)
}
