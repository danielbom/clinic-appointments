package api

import (
	"fmt"
	"net/http"

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

func (h *api) testInit(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	tx, err := h.pool.Begin(ctx)
	if err != nil {
		SomethingWentWrong(w, r, fmt.Errorf("failed to start transaction: %v", err))
		return
	}
	defer tx.Rollback(ctx)

	qTx := h.q.WithTx(tx)
	rs := NewRequestState(qTx, r)

	ucErr := usecase.ResetDb(rs)
	if ucErr != nil {
		UsecaseError(w, r, ucErr)
		return
	}

	_, ucErr = usecase.CreateAdmin(rs, usecase.CreateAdminArgs{
		Name:     "Admin Test",
		Email:    "admin@test.com",
		Password: "123mudar",
	})

	if ucErr != nil {
		UsecaseError(w, r, ucErr)
		return
	}

	if err := tx.Commit(ctx); err != nil {
		SomethingWentWrong(w, r, fmt.Errorf("failed to commit transaction: %v", err))
		return
	}

	render.JSON(w, r, "System initialized to be tested")
	render.Status(r, http.StatusOK)
}
