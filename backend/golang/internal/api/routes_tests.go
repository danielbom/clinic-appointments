package api

import (
	"encoding/json"
	"fmt"
	"net/http"

	"backend/internal/api/dtos"
	"backend/internal/usecase"

	"github.com/go-chi/render"
)

func (h *api) getTestStats(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	response := map[string]string{
		"message":  "Environment: TEST",
		"database": h.pool.Config().ConnString(),
	}
	if response["database"] == "" {
		response["database"] = "<empty>"
	}
	render.Status(r, http.StatusOK)
	render.JSON(w, r, response)
}

func (h *api) testDispatch(w http.ResponseWriter, r *http.Request) {
	// Collect query parameters, path parameters, and request body
	var body dtos.TestDispatch
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		InvalidJson(w, r)
		return
	}

	switch body.Kind {
	case "INIT":
		ctx := r.Context()
		tx, err := h.pool.Begin(ctx)
		if err != nil {
			SomethingWentWrong(w, r, fmt.Errorf("failed to start transaction: %v", err))
			return
		}
		defer tx.Rollback(ctx)

		qTx := h.q.WithTx(tx)
		rs := NewRequestState(qTx, r)

		if ucErr := testInit(rs); ucErr != nil {
			UsecaseError(w, r, ucErr)
			return
		}

		if err := tx.Commit(ctx); err != nil {
			SomethingWentWrong(w, r, fmt.Errorf("failed to commit transaction: %v", err))
			return
		}

		render.JSON(w, r, "System initialized to be tested")
		render.Status(r, http.StatusOK)
	default:
		InvalidJson(w, r)
		return
	}
}

func testInit(rs usecase.State) *usecase.UsecaseError {
	err := usecase.ResetDb(rs)
	if err != nil {
		return err
	}

	_, err = usecase.CreateAdmin(rs, usecase.CreateAdminArgs{
		Name:     "Admin Test",
		Email:    "admin@test.com",
		Password: "123mudar",
	})
	return err
}
