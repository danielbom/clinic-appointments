package api

import (
	"encoding/json"
	"fmt"
	"net/http"

	"backend/internal/api/dtos"
	"backend/internal/api/presenter"
	"backend/internal/usecase"

	"github.com/go-chi/render"
)

func (h *api) authLogin(w http.ResponseWriter, r *http.Request) {
	// Collect query parameters, path parameters, and request body
	var body dtos.AuthLoginBody
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		InvalidJson(w, r)
		return
	}

	// Validate e execute the usecase
	args := usecase.AuthLoginArgs{
		Email:    body.Email,
		Password: body.Password,
	}
	if err := args.Validate(); err != nil {
		UsecaseError(w, r, err)
		return
	}

	rs := NewRequestState(h.q, r)

	identity, err := usecase.AuthLogin(rs, args)
	if err != nil {
		UsecaseError(w, r, err)
		return
	}

	data := JwtData{
		UserID: identity.ID.String(),
		Role:   identity.Role,
	}

	accessToken, err2 := h.GenerateAccessJWT(data)
	if err2 != nil {
		SomethingWentWrong(w, r, err2)
		return
	}

	refreshToken, err3 := h.GenerateRefreshJWT(data)
	if err3 != nil {
		SomethingWentWrong(w, r, err3)
		return
	}

	// Format the response
	response := dtos.AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}
	render.Status(r, http.StatusOK)
	render.JSON(w, r, response)
}

func (h *api) authRefresh(w http.ResponseWriter, r *http.Request) {
	// Collect query parameters, path parameters, and request body
	refreshToken := TokenFromHeader(r)
	jwtData := GetJwtData(r)

	if !jwtData.IsRefreshToken() {
		AuthError(w, r, presenter.AUTH_INVALID_TOKEN)
		return
	}

	userID, ok := ParseUuid(jwtData.UserID)
	if !ok {
		SomethingWentWrong(w, r, fmt.Errorf("invalid token: userId"))
		return
	}

	// Validate e execute the usecase
	rs := NewRequestState(h.q, r)

	identity, err := usecase.AuthMe(rs, userID)
	if err != nil {
		SomethingWentWrong(w, r, fmt.Errorf("invalid token: identity"))
		return
	}

	data := JwtData{
		UserID: identity.ID.String(),
		Role:   identity.Role,
	}

	accessToken, err2 := h.GenerateAccessJWT(data)
	if err2 != nil {
		SomethingWentWrong(w, r, err2)
		return
	}

	// Format the response
	response := dtos.AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}
	render.Status(r, http.StatusOK)
	render.JSON(w, r, response)
}

func (h *api) authMe(w http.ResponseWriter, r *http.Request) {
	// Collect query parameters, path parameters, and request body
	jwtData := GetJwtData(r)

	if jwtData.IsRefreshToken() {
		SomethingWentWrong(w, r, fmt.Errorf("invalid token"))
		return
	}

	userID, ok := ParseUuid(jwtData.UserID)
	if !ok {
		SomethingWentWrong(w, r, fmt.Errorf("invalid token.userId"))
		return
	}

	// Validate e execute the usecase
	rs := NewRequestState(h.q, r)

	identity, err := usecase.AuthMe(rs, userID)
	if err != nil {
		UsecaseError(w, r, err)
		return
	}

	// Format the response
	response := dtos.Identity{
		ID:    identity.ID.String(),
		Name:  identity.Name,
		Email: identity.Email,
		Role:  identity.Role,
	}
	render.Status(r, http.StatusOK)
	render.JSON(w, r, response)
}
