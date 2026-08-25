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
func (h *api) healthCheck(w http.ResponseWriter, r *http.Request) {
	// Collect query parameters, path parameters, and request body

	// Validate and execute the usecase
	timestamp := time.Now().UTC().Format(time.RFC3339)
	environment := env.Get(env.APP_ENVIRONMENT)
	status := dtos.HEALTH_UP

	rs := NewRequestState(h.q, r)
	database := checkDatabase(rs)
	if database.Status != dtos.HEALTH_DOWN {
		databaseName := env.Get(env.DATABASE_NAME)
		dbSettings, err := usecase.GetDbSettings(rs, databaseName)
		if err == nil {
			database.Version = dbSettings.Version
			database.MaxConnections = dbSettings.MaxConnections
			database.OpenedConnections = dbSettings.OpenedConnections
			database.SchemaVersion = dbSettings.SchemaVersion
		} else {
			database.Status = dtos.HEALTH_DOWN
		}
	}

	if database.Status == dtos.HEALTH_DOWN {
		status = dtos.HEALTH_DOWN
	}

	// Format the response
	response := dtos.HealthCheck{
		Status:      status,
		Timestamp:   timestamp,
		Environment: environment,
		Details: dtos.HealthDetails{
			Database: database,
		},
	}
	render.Status(r, http.StatusOK)
	render.JSON(w, r, response)
}

func (h *api) healthLive(w http.ResponseWriter, r *http.Request) {
	// Collect query parameters, path parameters, and request body

	// Validate and execute the usecase
	timestamp := time.Now().UTC().Format(time.RFC3339)
	environment := env.Get(env.APP_ENVIRONMENT)
	status := dtos.HEALTH_UP

	// Format the response
	response := dtos.HealthLiveness{
		Status:      status,
		Timestamp:   timestamp,
		Environment: environment,
	}
	render.Status(r, http.StatusOK)
	render.JSON(w, r, response)
}

func (h *api) healthReady(w http.ResponseWriter, r *http.Request) {
	// Collect query parameters, path parameters, and request body

	// Validate and execute the usecase
	timestamp := time.Now().UTC().Format(time.RFC3339)
	environment := env.Get(env.APP_ENVIRONMENT)
	status := dtos.HEALTH_UP

	rs := NewRequestState(h.q, r)
	database := checkDatabase(rs)

	if database.Status == dtos.HEALTH_DOWN {
		status = dtos.HEALTH_DOWN
	}

	// Format the response
	response := dtos.HealthCheck{
		Status:      status,
		Timestamp:   timestamp,
		Environment: environment,
		Details: dtos.HealthDetails{
			Database: database,
		},
	}

	if response.Status == dtos.HEALTH_DOWN {
		render.Status(r, http.StatusServiceUnavailable)
	} else {
		render.Status(r, http.StatusOK)
	}
	render.JSON(w, r, response)
}

func checkDatabase(state usecase.State) (database dtos.HealthDatabase) {
	start := time.Now()
	ping, err := usecase.PingDb(state)
	database.LatencyMs = int32(time.Since(start).Milliseconds())
	if err != nil || ping != 1 {
		database.Status = dtos.HEALTH_DOWN
	} else if database.LatencyMs < 500 {
		database.Status = dtos.HEALTH_UP
	} else {
		database.Status = dtos.HEALTH_DEGRADED
	}
	return database
}
