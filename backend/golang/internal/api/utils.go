package api

import (
	"net/http"
	"strconv"

	"backend/internal/api/presenter"

	"github.com/go-chi/chi"
	"github.com/go-chi/render"
	"github.com/jackc/pgx/v5/pgtype"
)

func GetAndParseUuidParam(w http.ResponseWriter, r *http.Request, paramName string) (pgtype.UUID, bool) {
	rawId := chi.URLParam(r, paramName)
	result, ok := ParseUuid(rawId)
	if !ok {
		// Format the response
		response := presenter.ValidationProblem("path", paramName, "invalid uuid")
		EnhanceProblem(w, r, &response)
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, response)
	}
	return result, ok
}

func ParseUuid(rawID string) (pgtype.UUID, bool) {
	var result pgtype.UUID
	err := result.Scan(rawID)
	if err != nil {
		return result, false
	}
	return result, true
}

func ParseIntOrDefault(text string, defaultValue int32) int32 {
	if text == "" {
		return defaultValue
	}
	value, err := strconv.Atoi(text)
	if err != nil {
		return defaultValue
	}
	return int32(value)
}
