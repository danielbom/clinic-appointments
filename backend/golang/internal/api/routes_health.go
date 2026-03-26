package api

import (
	"time"

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
	dbSettings, err := usecase.GetDbSettings(rs, env.Get(env.DATABASE_NAME))
	dbStatus := "disconnected"
	if err == nil {
		dbStatus = "connected"
	}
	now := time.Now().UTC().Format(time.RFC3339)

	// Format the response
	response := dtos.Status{
		Environment: env.Get(env.APP_ENVIRONMENT),
		UpdatedAt:   now,
		Status:      dbStatus == "connected",
		Database: dtos.DatabaseStatus{
			Status:            dbStatus,
			Version:           dbSettings.Version,
			MaxConnections:    dbSettings.MaxConnections,
			OpenedConnections: dbSettings.OpenedConnections,
			SchemaVersion:     dbSettings.SchemaVersion,
		},
	}
	render.JSON(w, r, response)
	render.Status(r, http.StatusOK)
}
