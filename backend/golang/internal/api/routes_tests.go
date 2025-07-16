package api

import (
	"net/http"

	"backend/internal/api/presenter"
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
	render.JSON(w, r, response)
	render.Status(r, http.StatusOK)
}

func (h *api) testInit(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	tx, err := h.pool.Begin(ctx)
	if err != nil {
		http.Error(w, "failed to start transaction", http.StatusInternalServerError)
		return
	}
	defer tx.Rollback(ctx)

	_, err = tx.Exec(ctx, "DELETE FROM admins")
	if err != nil {
		http.Error(w, "failed to delete admins table", http.StatusInternalServerError)
		return
	}

	_, err = tx.Exec(ctx, "DELETE FROM appointments")
	if err != nil {
		http.Error(w, "failed to delete appointments table", http.StatusInternalServerError)
		return
	}

	_, err = tx.Exec(ctx, "DELETE FROM customers")
	if err != nil {
		http.Error(w, "failed to delete customers table", http.StatusInternalServerError)
		return
	}

	_, err = tx.Exec(ctx, "DELETE FROM secretaries")
	if err != nil {
		http.Error(w, "failed to delete secretaries table", http.StatusInternalServerError)
		return
	}

	_, err = tx.Exec(ctx, "DELETE FROM services")
	if err != nil {
		http.Error(w, "failed to delete services table", http.StatusInternalServerError)
		return
	}

	_, err = tx.Exec(ctx, "DELETE FROM service_names")
	if err != nil {
		http.Error(w, "failed to delete service_names table", http.StatusInternalServerError)
		return
	}

	_, err = tx.Exec(ctx, "DELETE FROM specialists")
	if err != nil {
		http.Error(w, "failed to delete specialists table", http.StatusInternalServerError)
		return
	}

	_, err = tx.Exec(ctx, "DELETE FROM specialist_hours")
	if err != nil {
		http.Error(w, "failed to delete specialist_hours table", http.StatusInternalServerError)
		return
	}

	_, err = tx.Exec(ctx, "DELETE FROM specializations")
	if err != nil {
		http.Error(w, "failed to delete specializations table", http.StatusInternalServerError)
		return
	}

	qTx := h.q.WithTx(tx)
	rs := NewRequestState(qTx, r)

	_, ucErr := usecase.CreateAdmin(rs, usecase.CreateAdminArgs{
		Name:     "Admin Test",
		Email:    "admin@test.com",
		Password: "123mudar",
	})

	if ucErr != nil {
		presenter.UsecaseError(w, ucErr)
		return
	}

	if err := tx.Commit(ctx); err != nil {
		http.Error(w, "failed to commit transaction", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("System initialized to be tested"))
}
