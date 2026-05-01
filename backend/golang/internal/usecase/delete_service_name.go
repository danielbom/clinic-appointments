package usecase

import (
	"github.com/jackc/pgx/v5/pgtype"
)

func DeleteServiceName(state State, id pgtype.UUID) *UsecaseError {
	count, err := state.Queries().DeleteServiceNameByID(state.Context(), id)
	if err != nil {
		return NewUnexpectedError(err)
	}
	if count == 0 {
		return NewNotFoundError("service_name")
	}
	return nil
}
