package api

import (
	"log/slog"
	"net/http"

	"backend/internal/api/presenter"

	"github.com/go-chi/render"
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
