package api

import (
	"encoding/json"

	"net/http"

	"backend/internal/api/dtos"
	"backend/internal/usecase"

	"github.com/go-chi/render"
)

func (h *api) prepareInvoice(w http.ResponseWriter, r *http.Request) {
	// Authorize access
	jwtData := GetJwtData(r)
	if !jwtData.HasAccess("secretary") {
		InvalidAccess(w, r, "Role without access")
		return
	}

	// Collect query parameters, path parameters, and request body
	var body dtos.InvoicesPreviewBody
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		InvalidJson(w, r)
		return
	}

	// Validate and execute the usecase
	args := usecase.PrepareInvoiceArgs{
		SpecialistIdRaw: body.SpecialistId,
		StartDateRaw:    body.StartDate,
		EndDateRaw:      body.EndDate,
	}
	if err := args.Validate(); err != nil {
		UsecaseError(w, r, err)
		return
	}

	rs := NewRequestState(h.q, r)
	response, err := usecase.PrepareInvoice(rs, args)
	if err != nil {
		UsecaseError(w, r, err)
		return
	}

	// Format the response
	render.Status(r, http.StatusOK)
	render.JSON(w, r, response)
}
