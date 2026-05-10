package usecase

import (
	"backend/internal/infra"

	"github.com/jackc/pgx/v5/pgtype"
)

func GetSecretary(state State, id pgtype.UUID) (infra.Secretary, *UsecaseError) {
	secretary, err := state.Queries().GetSecretaryByID(state.Context(), id)
	if err == nil {
		return secretary, nil
	}
	if ErrorIsNoRows(err) {
		return secretary, NewNotFoundError("secretary")
	}
	return secretary, NewUnexpectedError(err)
}
