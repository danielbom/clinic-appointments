package api

import (
	"net/http"

	_ "backend/internal/api/docs"
	"backend/internal/env"
	"backend/internal/infra"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/cors"
	"github.com/go-chi/jwtauth"
	"github.com/jackc/pgx/v5/pgxpool"
	httpSwagger "github.com/swaggo/http-swagger/v2"
)

type api struct {
	q    *infra.Queries
	pool *pgxpool.Pool
	auth *jwtauth.JWTAuth
}

// @title			Appointsments API
// @version		1.0
// @description	This is an API for managing appointments
// @termsOfService	http://swagger.io/terms/
// @contact.name	Daniel A. R. Farina
// @contact.url	http://www.github.com/danielbom
// @contact.email	daniel.rodrigues.45g@gmail.com
// @license.name	Apache 2.0
// @license.url	http://www.apache.org/licenses/LICENSE-2.0.html
// @host		localhost:8080
// @BasePath	/
// @securityDefinitions.apikey	ApiKeyAuth
// @in							header
// @name						"Authorization"
// @externalDocs.description	OpenAPI
// @externalDocs.url			https://swagger.io/resources/open-api/
func NewApi(pool *pgxpool.Pool, auth *jwtauth.JWTAuth) http.Handler {
	q := infra.New(pool)
	h := &api{q, pool, auth}

	r := chi.NewRouter()
	r.Use(middleware.RequestID, middleware.Recoverer, middleware.Logger)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: false,
		MaxAge:           300, // Maximum value not ignored by any of major browsers
	}))

	r.Get("/api/health", h.health)

	r.Post("/api/auth/login", h.authLogin)

	r.With(h.JWT).Post("/api/auth/refresh", h.authRefresh)
	r.With(h.JWT).Get("/api/auth/me", h.authMe)

	r.With(h.JWT).Get("/api/appointments", h.getAppointments)
	r.With(h.JWT).Get("/api/appointments/count", h.countAppointments)
	r.With(h.JWT).Get("/api/appointments/calendar", h.getAppointmentsCalendar)
	r.With(h.JWT).Get("/api/appointments/calendar/count", h.getAppointmentsCalendarCount)
	r.With(h.JWT).Get("/api/appointments/{appointment_id}", h.getAppointment)
	r.With(h.JWT).Post("/api/appointments", h.createAppointment)
	r.With(h.JWT).Put("/api/appointments/{appointment_id}", h.updateAppointment)
	r.With(h.JWT).Delete("/api/appointments/{appointment_id}", h.deleteAppointment)

	r.With(h.JWT).Get("/api/customers", h.getCustomers)
	r.With(h.JWT).Get("/api/customers/count", h.countCustomers)
	r.With(h.JWT).Get("/api/customers/{customer_id}", h.getCustomer)
	r.With(h.JWT).Post("/api/customers", h.createCustomer)
	r.With(h.JWT).Put("/api/customers/{customer_id}", h.updateCustomer)
	r.With(h.JWT).Delete("/api/customers/{customer_id}", h.deleteCustomer)

	r.With(h.JWT).Get("/api/secretaries", h.getSecretaries)
	r.With(h.JWT).Get("/api/secretaries/count", h.countSecretaries)
	r.With(h.JWT).Get("/api/secretaries/{secretary_id}", h.getSecretary)
	r.With(h.JWT).Post("/api/secretaries", h.createSecretary)
	r.With(h.JWT).Put("/api/secretaries/{secretary_id}", h.updateSecretary)
	r.With(h.JWT).Delete("/api/secretaries/{secretary_id}", h.deleteSecretary)

	r.With(h.JWT).Get("/api/specialists", h.listSpecialists)
	r.With(h.JWT).Get("/api/specialists/count", h.countSpecialists)
	r.With(h.JWT).Get("/api/specialists/{specialist_id}", h.getSpecialist)
	r.With(h.JWT).Get("/api/specialists/{specialist_id}/appointments", h.getSpecialistAppointments)
	r.With(h.JWT).Get("/api/specialists/{specialist_id}/specializations", h.getSpecialistSpecializations)
	r.With(h.JWT).Get("/api/specialists/{specialist_id}/services", h.getSpecialistServices)
	r.With(h.JWT).Get("/api/specialists/{specialist_id}/services/{service_id}", h.getSpecialistService)
	r.With(h.JWT).Post("/api/specialists", h.createSpecialist)
	r.With(h.JWT).Put("/api/specialists/{specialist_id}", h.updateSpecialist)
	r.With(h.JWT).Delete("/api/specialists/{specialist_id}", h.deleteSpecialist)

	r.With(h.JWT).Get("/api/specializations", h.getSpecializations)
	r.With(h.JWT).Post("/api/specializations", h.createSpecialization)
	r.With(h.JWT).Put("/api/specializations/{specialization_id}", h.updateSpecialization)
	r.With(h.JWT).Delete("/api/specializations/{specialization_id}", h.deleteSpecialization)

	r.With(h.JWT).Get("/api/service-groups", h.getServiceGroups)

	r.With(h.JWT).Get("/api/services", h.getServices)
	r.With(h.JWT).Get("/api/services/count", h.countServices)
	r.With(h.JWT).Get("/api/services/{service_id}", h.getService)
	r.With(h.JWT).Post("/api/services", h.createService)
	r.With(h.JWT).Put("/api/services/{service_id}", h.updateService)
	r.With(h.JWT).Delete("/api/services/{service_id}", h.deleteService)

	r.With(h.JWT).Get("/api/services-available", h.getServicesAvailable)
	// r.With(h.JWT).Get("/api/services-available/count", h.countAvailableServices)
	r.With(h.JWT).Get("/api/services-available/{service_id}", h.getServiceAvailable)
	r.With(h.JWT).Post("/api/services-available", h.createServiceAvailable)
	r.With(h.JWT).Put("/api/services-available/{service_id}", h.updateServiceAvailable)
	r.With(h.JWT).Delete("/api/services-available/{service_id}", h.deleteServiceAvailable)

	if env.Get(env.APP_ENVIRONMENT) == "TEST" {
		r.Get("/api/test/stats", h.getTestStats)
		r.Get("/api/test/init", h.testInit)
	}

	r.Get("/api/swagger/*", httpSwagger.Handler(
		httpSwagger.URL("http://localhost:8080/swagger/doc.json"), //The url pointing to API definition
	))

	return r
}
