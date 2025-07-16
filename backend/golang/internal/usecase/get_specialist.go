package usecase

import (
	"github.com/google/uuid"

	"backend/internal/infra"
)

func GetSpecialist(state State, specialistID uuid.UUID) (infra.Specialist, *UsecaseError) {
	specialist, err := state.Queries().GetSpecialistByID(state.Context(), specialistID)
	if err != nil {
		return specialist, NewUnexpectedError(err)
	}
	return specialist, nil
}
