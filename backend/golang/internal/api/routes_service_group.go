package api

import (
	"net/http"

	"backend/internal/api/presenter"
	"backend/internal/usecase"

	"github.com/go-chi/render"
)

func (h *api) listServiceGroups(w http.ResponseWriter, r *http.Request) {
	// Collect query parameters, path parameters, and request body

	// Validate e execute the usecase
	rs := NewRequestState(h.q, r)

	specializations, serviceNames, err := usecase.ListServiceGroups(rs)
	if err != nil {
		UsecaseError(w, r, err)
		return
	}

	// Format the response
	response := presenter.GetServiceGroups(specializations, serviceNames)
	render.Status(r, http.StatusOK)
	render.JSON(w, r, response)
}
