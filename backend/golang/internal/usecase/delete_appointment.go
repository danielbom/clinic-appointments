package usecase

import (
	"github.com/jackc/pgx/v5/pgtype"
)

func DeleteAppointment(state State, id pgtype.UUID) *UsecaseError {
	count, err := state.Queries().DeleteAppointment(state.Context(), id)
	if err != nil {
		return NewError(ErrorKindUnexpected, err)
	}
	if count == 0 {
		return NewNotFoundError(ErrResourceNotFound).InField("appointment")
	}
	return nil
}
