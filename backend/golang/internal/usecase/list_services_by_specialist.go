package usecase

import (
	"backend/internal/infra"

	"github.com/jackc/pgx/v5/pgtype"
)

func GetServicesBySpecialistID(state State, specialistID pgtype.UUID) ([]infra.ListServicesBySpecialistIDRow, *UsecaseError) {
	services, err := state.Queries().ListServicesBySpecialistID(state.Context(), specialistID)
	if err != nil {
		return nil, NewUnexpectedError(err)
	}
	return services, nil
}
