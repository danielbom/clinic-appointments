package usecase

import (
	"github.com/jackc/pgx/v5/pgtype"
)

func DeleteServiceName(state State, id pgtype.UUID) *UsecaseError {
	count, err := state.Queries().DeleteServiceNameByID(state.Context(), id)
	if err != nil {
		return NewError(ErrorKindUnexpected, err)
	}
	if count == 0 {
		return NewNotFoundError(ErrResourceNotFound).InField("service_name")
	}
	return nil
}
