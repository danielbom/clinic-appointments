package usecase

import (
	"github.com/jackc/pgx/v5/pgtype"
)

func DeleteSpecialistService(state State, serviceID pgtype.UUID) *UsecaseError {
	count, err := state.Queries().DeleteService(state.Context(), serviceID)
	if err != nil {
		return NewError(ErrorKindUnexpected, err)
	}
	if count == 0 {
		return NewNotFoundError(ErrResourceNotFound).InField("service")
	}
	return nil
}
