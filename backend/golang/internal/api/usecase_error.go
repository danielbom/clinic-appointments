package api

import (
	"log/slog"
	"net/http"

	"backend/internal/api/dtos"
	"backend/internal/api/presenter"
	"backend/internal/usecase"

	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/render"
)

func EnhanceProblem(w http.ResponseWriter, r *http.Request, p *dtos.ProblemDetails) {
	p.Instance = r.URL.String()
	p.TraceId = middleware.GetReqID(r.Context())
}

func UsecaseError(w http.ResponseWriter, r *http.Request, err *usecase.UsecaseError) {
	switch err.Kind {
	case usecase.ErrorKindInvalidState:
		// Format the response
		response := presenter.InvalidStateProblem(err.Error.Error())
		EnhanceProblem(w, r, &response)
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, response)
		return
	case usecase.ErrorKindInvalidArgument:
		// Format the response
		location := "args"
		switch err.Action {
		case usecase.ACTION_QUERY:
			location = "query"
		case usecase.ACTION_MUTATION:
			location = "body"
		}
		response := presenter.ValidationProblem(location, err.Key, err.Error.Error())
		EnhanceProblem(w, r, &response)
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, response)
		return
	case usecase.ErrorKindAuth:
		slog.Info("auth error", "error", err.Error)
		// Format the response
		response := presenter.AuthProblem(presenter.AUTH_INVALID_CREDENTIALS)
		EnhanceProblem(w, r, &response)
		render.Status(r, http.StatusUnauthorized)
		render.JSON(w, r, response)
		return
	case usecase.ErrorKindNotFound:
		// Format the response
		response := presenter.NotFoundProblem(err.Resource)
		EnhanceProblem(w, r, &response)
		render.Status(r, http.StatusNotFound)
		render.JSON(w, r, response)
		return
	case usecase.ErrorKindAlreadyExists:
		// Format the response
		response := presenter.AlreadyExistsProblem(err.Resource, err.Key)
		EnhanceProblem(w, r, &response)
		render.Status(r, http.StatusConflict)
		render.JSON(w, r, response)
		return
	case usecase.ErrorKindUnexpected:
		slog.Error("something went wrong", "error", err.Error)
		// Format the response
		response := presenter.InternalProblem("something went wrong")
		EnhanceProblem(w, r, &response)
		render.Status(r, http.StatusInternalServerError)
		render.JSON(w, r, response)
		return
	}
	slog.Error("unknown error kind", "error", err.Error)
	response := presenter.InternalProblem("unknown error kind")
	EnhanceProblem(w, r, &response)
	render.Status(r, http.StatusInternalServerError)
	render.JSON(w, r, response)
}
