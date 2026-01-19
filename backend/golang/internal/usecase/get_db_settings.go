package usecase

import "backend/internal/infra"

func GetDbSettings(state State, database string) (infra.DbSettings, error) {
	return state.Queries().GetDbSettings(state.Context(), database)
}
