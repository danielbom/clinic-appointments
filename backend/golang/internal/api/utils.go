package api

import (
	"log/slog"
	"net/http"
	"strconv"

	"backend/internal/api/presenter"

	"github.com/go-chi/chi"
	"github.com/go-chi/render"
	"github.com/jackc/pgx/v5/pgtype"
)

func InvalidJson(w http.ResponseWriter, r *http.Request) {
	// Format the response
	response := presenter.ValidationProblem("body", "/", "")
	EnhanceProblem(w, r, &response)
	render.Status(r, http.StatusBadRequest)
	render.JSON(w, r, response)
}

func InvalidAccess(w http.ResponseWriter, r *http.Request, detail string) {
	// Format the response
	response := presenter.InvalidAccess(detail)
	EnhanceProblem(w, r, &response)
	render.Status(r, response.Status)
	render.JSON(w, r, response)
}

func AuthError(w http.ResponseWriter, r *http.Request, problem presenter.AuthProblemType) {
	// Format the response
	response := presenter.AuthProblem(problem)
	EnhanceProblem(w, r, &response)
	render.Status(r, response.Status)
	render.JSON(w, r, response)
}

func SomethingWentWrong(w http.ResponseWriter, r *http.Request, err error) {
	slog.Error("something went wrong", "error", err)
	// Format the response
	response := presenter.InternalProblem("something went wrong")
	EnhanceProblem(w, r, &response)
	render.Status(r, response.Status)
	render.JSON(w, r, response)
}

func GetAndParseUuidParam(w http.ResponseWriter, r *http.Request, paramName string) (pgtype.UUID, bool) {
	rawId := chi.URLParam(r, paramName)
	result, ok := ParseUuid(rawId)
	if !ok {
		// Format the response
		response := presenter.ValidationProblem("path", paramName, "invalid uuid format")
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
