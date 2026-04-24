package api

import (
	"log/slog"
	"net/http"
	"strconv"

	"github.com/go-chi/chi"

	"github.com/jackc/pgx/v5/pgtype"
)

func InvalidJson(w http.ResponseWriter) {
	http.Error(w, "invalid json", http.StatusBadRequest)
}

func SomethingWentWrong(w http.ResponseWriter, err error) {
	slog.Error("something went wrong", "error", err)
	http.Error(w, "something went wrong", http.StatusInternalServerError)
}

func GetAndParseUuidParam(w http.ResponseWriter, r *http.Request, paramName string) (pgtype.UUID, bool) {
	rawId := chi.URLParam(r, paramName)
	return ParseUuidParam(w, rawId, paramName)
}

func ParseUuid(rawID string) (pgtype.UUID, bool) {
	var result pgtype.UUID
	err := result.Scan(rawID)
	if err != nil {
		return result, false
	}
	return result, true
}

func ParseUuidParam(w http.ResponseWriter, rawID string, paramName string) (pgtype.UUID, bool) {
	result, ok := ParseUuid(rawID)
	if !ok {
		slog.Warn("invalid param", paramName, rawID)
		http.Error(w, "invalid uuid param: "+paramName, http.StatusBadRequest)
	}
	return result, ok
}

func ParseIntOrDefault(text string, defaultValue int32) int32 {
	if text == "" {
		return defaultValue
	}
	value, err := strconv.Atoi(text)
	if err != nil {
		return defaultValue
	}
	return int32(value)
}
