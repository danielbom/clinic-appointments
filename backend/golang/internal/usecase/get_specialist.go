package usecase

import (
	"backend/internal/infra"

	"github.com/jackc/pgx/v5/pgtype"
)

func GetSpecialist(state State, specialistID pgtype.UUID) (infra.Specialist, *UsecaseError) {
	specialist, err := state.Queries().GetSpecialistByID(state.Context(), specialistID)
	if err == nil {
		return specialist, nil
	}
	if ErrorIsNoRows(err) {
		return specialist, NewNotFoundError("specialist")
	}
	return specialist, NewUnexpectedError(err)
}
