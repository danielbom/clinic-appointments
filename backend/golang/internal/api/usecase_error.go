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
	var response dtos.ProblemDetails
	switch err.Kind {
	case usecase.ErrorKindInvalidState:
		response = presenter.InvalidStateProblem(err.Error.Error())
	case usecase.ErrorKindInvalidArgument:
		location := "args"
		switch err.Action {
		case usecase.ACTION_QUERY:
			location = "query"
		case usecase.ACTION_MUTATION:
			location = "body"
		}
		response = presenter.ValidationProblem(location, err.Key, err.Error.Error())
	case usecase.ErrorKindAuth:
		slog.Info("auth error", "error", err.Error)
		response = presenter.AuthProblem(presenter.AUTH_INVALID_CREDENTIALS)
	case usecase.ErrorKindNotFound:
		response = presenter.NotFoundProblem(err.Resource)
	case usecase.ErrorKindAlreadyExists:
		response = presenter.AlreadyExistsProblem(err.Resource, err.Key)
	case usecase.ErrorKindScheduleConflict:
		response = presenter.ScheduleConflictProblem(err.Resource, err.Key)
	case usecase.ErrorKindUnexpected:
		slog.Error("something went wrong", "error", err.Error)
		response = presenter.InternalProblem("something went wrong")
	}
	if response.Status == 0 {
		slog.Error("unknown error kind", "error", err.Error)
		response = presenter.InternalProblem("unknown error kind")
	}
	EnhanceProblem(w, r, &response)
	render.Status(r, response.Status)
	render.JSON(w, r, response)
}
