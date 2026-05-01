package api

import (
	"encoding/json"
	"net/http"

	"backend/internal/api/dtos"
	"backend/internal/api/presenter"
	"backend/internal/usecase"

	"github.com/go-chi/render"
)

// @Summary      Get customer
// @Security     ApiKeyAuth
// @Description  Get a customer by id
// @Tags         Customers
// @Produce      json
// @Success      200 {object}  dtos.Customer
// @Router       /customers/{id} [get]
func (h *api) getCustomer(w http.ResponseWriter, r *http.Request) {
	// Collect query parameters, path parameters, and request body
	customerId, ok := GetAndParseUuidParam(w, r, "id")
	if !ok {
		return
	}

	// Validate e execute the usecase
	rs := NewRequestState(h.q, r)

	customer, err := usecase.GetCustomer(rs, customerId)
	if err != nil {
		UsecaseError(w, r, err)
		return
	}

	// Format the response
	response := presenter.GetCustomer(customer)
	render.Status(r, http.StatusOK)
	render.JSON(w, r, response)
}

// @Summary      List customers
// @Security     ApiKeyAuth
// @Description  Get a page of customers with filters
// @Tags         Customers
// @Produce      json
// @Param        page      query int     false "Page"
// @Param        pageSize  query int     false "Page size"
// @Param        name      query string  false "Name"
// @Param        cpf       query string  false "CPF"
// @Param        phone     query string  false "Phone"
// @Success      200 {object}  []dtos.Customer
// @Router       /customers [get]
func (h *api) listCustomers(w http.ResponseWriter, r *http.Request) {
	// Collect query parameters, path parameters, and request body
	query := r.URL.Query()
	page := ParseIntOrDefault(query.Get("page"), 0)
	pageSize := ParseIntOrDefault(query.Get("pageSize"), 10)
	name := query.Get("name")
	cpf := query.Get("cpf")
	phone := query.Get("phone")

	// Validate e execute the usecase
	args := usecase.ListCustomersArgs{
		PaginationArgs: usecase.PaginationArgs{
			PageSize: pageSize,
			Page:     page,
		},
		CountArgs: usecase.CountCustomersArgs{
			Cpf:   cpf,
			Phone: phone,
			Name:  name,
		},
	}
	if err := args.Validate(); err != nil {
		UsecaseError(w, r, err)
		return
	}

	rs := NewRequestState(h.q, r)

	customers, err := usecase.ListCustomers(rs, args)
	if err != nil {
		UsecaseError(w, r, err)
		return
	}

	// Format the response
	response := presenter.GetCustomers(customers)
	render.Status(r, http.StatusOK)
	render.JSON(w, r, response)
}

// @Summary      Count customers
// @Security     ApiKeyAuth
// @Description  Count customers with filters
// @Tags         Customers
// @Produce      json
// @Param        name      query string  false "Name"
// @Param        cpf       query string  false "CPF"
// @Param        phone     query string  false "Phone"
// @Success      200 {object}  int
// @Router       /customers/count [get]
func (h *api) countCustomers(w http.ResponseWriter, r *http.Request) {
	// Collect query parameters, path parameters, and request body
	query := r.URL.Query()
	name := query.Get("name")
	cpf := query.Get("cpf")
	phone := query.Get("phone")

	// Validate e execute the usecase
	args := usecase.CountCustomersArgs{
		Cpf:   cpf,
		Phone: phone,
		Name:  name,
	}
	if err := args.Validate(); err != nil {
		UsecaseError(w, r, err)
		return
	}

	rs := NewRequestState(h.q, r)

	count, err := usecase.CountCustomers(rs, args)
	if err != nil {
		UsecaseError(w, r, err)
		return
	}

	// Format the response
	render.JSON(w, r, count)
	render.Status(r, http.StatusOK)
}

// @Summary      Create customer
// @Security     ApiKeyAuth
// @Description  Create an new customer
// @Tags         Customers
// @Produce      json
// @Param 		  data body dtos.CustomerInfoBody true "Customer information"
// @Success      200 {object}  dtos.Id
// @Router       /customers [post]
func (h *api) createCustomer(w http.ResponseWriter, r *http.Request) {
	// Collect query parameters, path parameters, and request body
	var body dtos.CustomerInfoBody
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		InvalidJson(w, r)
		return
	}

	// Validate e execute the usecase
	args := usecase.CustomerInfoArgs{
		Name:      body.Name,
		Email:     body.Email,
		Phone:     body.Phone,
		Birthdate: body.Birthdate,
		Cpf:       body.Cpf,
	}
	if err := args.Validate(); err != nil {
		UsecaseError(w, r, err)
		return
	}

	rs := NewRequestState(h.q, r)

	customer, err := usecase.CreateCustomer(rs, args)
	if err != nil {
		UsecaseError(w, r, err)
		return
	}

	// Format the response
	response := dtos.Id{ID: customer.ID.String()}
	render.Status(r, http.StatusCreated)
	render.JSON(w, r, response)
}

// @Summary      Update customer
// @Security     ApiKeyAuth
// @Description  Update a customer by id
// @Tags         Customers
// @Produce      json
// @Success      200 {object}  dtos.Id
// @Router       /customers/{id} [put]
func (h *api) updateCustomer(w http.ResponseWriter, r *http.Request) {
	// Collect query parameters, path parameters, and request body
	customerId, ok := GetAndParseUuidParam(w, r, "id")
	if !ok {
		return
	}
	var body dtos.CustomerInfoBody
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		InvalidJson(w, r)
		return
	}

	// Validate e execute the usecase
	args := usecase.CustomerInfoArgs{
		Name:      body.Name,
		Email:     body.Email,
		Phone:     body.Phone,
		Birthdate: body.Birthdate,
		Cpf:       body.Cpf,
	}
	if err := args.Validate(); err != nil {
		UsecaseError(w, r, err)
		return
	}

	rs := NewRequestState(h.q, r)

	customer, err := usecase.UpdateCustomer(rs, customerId, args)
	if err != nil {
		UsecaseError(w, r, err)
		return
	}

	// Format the response
	response := dtos.Id{ID: customer.ID.String()}
	render.Status(r, http.StatusOK)
	render.JSON(w, r, response)
}

// @Summary      Delete customer
// @Security     ApiKeyAuth
// @Description  Delete a customer by id
// @Tags         Customers
// @Produce      json
// @Success      204
// @Router       /customers/{id} [delete]
func (h *api) deleteCustomer(w http.ResponseWriter, r *http.Request) {
	// Collect query parameters, path parameters, and request body
	customerId, ok := GetAndParseUuidParam(w, r, "id")
	if !ok {
		return
	}

	// Validate e execute the usecase
	rs := NewRequestState(h.q, r)

	err := usecase.DeleteCustomer(rs, customerId)
	if err != nil {
		UsecaseError(w, r, err)
		return
	}

	// Format the response
	render.NoContent(w, r)
}
