package usecase

import (
	"backend/internal/domain"
	"backend/internal/infra"

	"github.com/google/uuid"
)

type CustomerInfoArgs struct {
	Name         domain.String
	Email        domain.String
	Phone        domain.String
	BirthdateRaw string
	Birthdate    domain.Date
	Cpf          domain.String
}

func (args *CustomerInfoArgs) Validate() *UsecaseError {
	if err := args.Birthdate.Scan(args.BirthdateRaw); err != nil {
		return NewInvalidArgumentError(err).InField("birthdate")
	}
	if err := args.Name.Required(); err != nil {
		return NewInvalidArgumentError(err).InField("name")
	}
	if err := args.Phone.Required(); err != nil {
		return NewInvalidArgumentError(err).InField("phone")
	}
	if err := args.Cpf.Required(); err != nil {
		return NewInvalidArgumentError(err).InField("cpf")
	}
	if err := args.Cpf.IsCpf(); err != nil {
		return NewInvalidArgumentError(err).InField("cpf")
	}
	return nil
}

func CustomerWithPhoneExists(state State, phone string, exceptId uuid.UUID) (bool, error) {
	customer, err := state.Queries().GetCustomerByPhone(state.Context(), phone)
	if ErrorIsNoRows(err) {
		return false, nil
	}
	if err != nil {
		return false, err
	}
	if customer.ID == exceptId {
		return false, nil
	}
	return true, nil
}

func CreateCustomer(state State, args CustomerInfoArgs) (infra.Customer, *UsecaseError) {
	var none infra.Customer
	exists, err := CustomerWithPhoneExists(state, args.Phone.Value, uuid.Nil)
	if err != nil {
		return none, NewUnexpectedError(err)
	}
	if exists {
		return none, NewResourceAlreadyExistsError("customer.phone")
	}
	params := infra.CreateCustomerParams{
		Name:      args.Name.Value,
		Email:     args.Email.Text(),
		Phone:     args.Phone.Value,
		Birthdate: args.Birthdate.Value,
		Cpf:       args.Cpf.Value,
	}
	customer, err := state.Queries().CreateCustomer(state.Context(), params)
	if err != nil {
		return none, NewUnexpectedError(err)
	}
	return customer, nil
}

func UpdateCustomer(state State, customerId uuid.UUID, args CustomerInfoArgs) (infra.Customer, *UsecaseError) {
	var none infra.Customer
	exists, err := CustomerWithPhoneExists(state, args.Phone.Value, customerId)
	if err != nil {
		return none, NewUnexpectedError(err)
	}
	if exists {
		return none, NewResourceAlreadyExistsError("customer.phone")
	}
	params := infra.UpdateCustomerParams{
		ID:        customerId,
		Name:      args.Name.Value,
		Email:     args.Email.Text(),
		Phone:     args.Phone.Value,
		Birthdate: args.Birthdate.Value,
		Cpf:       args.Cpf.Value,
	}
	customer, err := state.Queries().UpdateCustomer(state.Context(), params)
	if err != nil {
		return customer, NewUnexpectedError(err)
	}
	return customer, nil
}
