package api

import (
	"net/http"

	"backend/internal/api/dtos"
	"backend/internal/env"
	"backend/internal/usecase"

	"github.com/go-chi/render"
)

// @Summary     Health check
// @Description Check if the service is healthy
// @Tags        API
// @Produce     json
// @Success     200 {object}  string
// @Router      /health [get]
func (h *api) health(w http.ResponseWriter, r *http.Request) {
	// Collect query parameters, path parameters, and request body

	// Validate e execute the usecase
	rs := NewRequestState(h.q, r)
	dbOk := usecase.GetStatus(rs)
	dbStatus := "disconnected"
	if dbOk {
		dbStatus = "connected"
	}

	// Format the response
	response := dtos.Status{
		Environment: env.Get(env.APP_ENVIRONMENT),
		Database:    dbStatus,
		Status:      dbOk,
	}
	render.JSON(w, r, response)
	render.Status(r, http.StatusOK)
}
