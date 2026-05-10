package api

import (
	"encoding/json"
	"net/http"

	"backend/internal/api/dtos"
	"backend/internal/api/presenter"
	"backend/internal/usecase"

	"github.com/go-chi/render"
)

func (h *api) listServicesAvailable(w http.ResponseWriter, r *http.Request) {
	h.listServiceGroups(w, r)
}

func (h *api) getServiceAvailable(w http.ResponseWriter, r *http.Request) {
	// Collect query parameters, path parameters, and request body
	serviceId, ok := GetAndParseUuidParam(w, r, "id")
	if !ok {
		return
	}

	// Validate e execute the usecase
	rs := NewRequestState(h.q, r)

	service, err := usecase.GetServiceAvailable(rs, serviceId)
	if err != nil {
		UsecaseError(w, r, err)
		return
	}

	// Format the response
	response := presenter.GetServiceAvailable(service)
	render.Status(r, http.StatusOK)
	render.JSON(w, r, response)
}

func (h *api) createServiceAvailable(w http.ResponseWriter, r *http.Request) {
	// Collect query parameters, path parameters, and request body
	var body dtos.CreateServiceAvailableBody
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		InvalidJson(w, r)
		return
	}

	// Validate e execute the usecase
	args := usecase.CreateServiceNameArgs{
		Name:                body.Name,
		Specialization:      body.Specialization,
		SpecializationIDRaw: body.SpecializationID,
	}
	if err := args.Validate(); err != nil {
		UsecaseError(w, r, err)
		return
	}

	rs := NewRequestState(h.q, r)

	id, err := usecase.CreateServiceName(rs, args)
	if err != nil {
		UsecaseError(w, r, err)
		return
	}

	// Format the response
	response := dtos.Id{ID: id.String()}
	render.Status(r, http.StatusCreated)
	render.JSON(w, r, response)
}

func (h *api) updateServiceAvailable(w http.ResponseWriter, r *http.Request) {
	// Collect query parameters, path parameters, and request body
	serviceId, ok := GetAndParseUuidParam(w, r, "id")
	if !ok {
		return
	}

	var body dtos.UpdateServiceAvailableBody
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		InvalidJson(w, r)
		return
	}

	// Validate e execute the usecase
	args := usecase.UpdateServiceNameArgs{
		Name: body.Name,
	}
	if err := args.Validate(); err != nil {
		UsecaseError(w, r, err)
		return
	}

	rs := NewRequestState(h.q, r)

	id, err := usecase.UpdateServiceName(rs, serviceId, args)
	if err != nil {
		UsecaseError(w, r, err)
		return
	}

	// Format the response
	response := dtos.Id{ID: id.String()}
	render.Status(r, http.StatusOK)
	render.JSON(w, r, response)
}

func (h *api) deleteServiceAvailable(w http.ResponseWriter, r *http.Request) {
	// Collect query parameters, path parameters, and request body
	serviceId, ok := GetAndParseUuidParam(w, r, "id")
	if !ok {
		return
	}

	// Validate e execute the usecase
	rs := NewRequestState(h.q, r)

	err := usecase.DeleteServiceName(rs, serviceId)
	if err != nil {
		UsecaseError(w, r, err)
		return
	}

	// Format the response
	render.NoContent(w, r)
}
