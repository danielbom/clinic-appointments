package api

import (
	"log/slog"
	"net/http"
	"time"

	"backend/internal/api/presenter"

	jwtGo "github.com/dgrijalva/jwt-go"
	"github.com/go-chi/jwtauth"
	"github.com/lestrrat-go/jwx/jwt"
)

type JwtData struct {
	UserID string
	Role   string
}

func (h *api) GenerateAccessJWT(data JwtData) (string, error) {
	_, tokenString, err := h.auth.Encode(jwtGo.MapClaims{
		"sub":  data.UserID,
		"role": data.Role,
		"exp":  time.Now().Add(time.Minute * 10).Unix(),
	})
	return tokenString, err
}

func (h *api) GenerateRefreshJWT(data JwtData) (string, error) {
	_, tokenString, err := h.auth.Encode(jwtGo.MapClaims{
		"sub": data.UserID,
		"exp": time.Now().Add(time.Hour * 24).Unix(),
	})
	return tokenString, err
}

func (h *api) JWT(next http.Handler) http.Handler {
	// return jwtauth.Verifier(h.auth)(jwtauth.Authenticator(next))
	return jwtauth.Verifier(h.auth)(
		http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			token, _, err := jwtauth.FromContext(r.Context())

			if err != nil {
				slog.Error("auth error", "error", err)
				AuthError(w, r, presenter.AUTH_INVALID_TOKEN)
				return
			}

			if token == nil || jwt.Validate(token) != nil {
				slog.Error("auth error", "error", err)
				AuthError(w, r, presenter.AUTH_INVALID_TOKEN)
				return
			}

			// Token is authenticated, pass it through
			next.ServeHTTP(w, r)
		}),
	)
}

func GetJwtData(r *http.Request) JwtData {
	_, claims, _ := jwtauth.FromContext(r.Context())
	userID, _ := claims["sub"].(string)
	role, _ := claims["role"].(string)
	return JwtData{UserID: userID, Role: role}
}

func TokenFromHeader(r *http.Request) string {
	return jwtauth.TokenFromHeader(r)
}

func (j *JwtData) IsRefreshToken() bool {
	return j.Role == ""
}

func (j *JwtData) HasAccess(roles ...string) bool {
	if j.Role == "admin" {
		return true
	}

	for _, role := range roles {
		if j.Role == role {
			return true
		}
	}

	return false
}
