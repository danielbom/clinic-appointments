package usecase

import (
	"backend/internal/infra"
	"backend/internal/validate"

	"github.com/jackc/pgx/v5/pgtype"
)

type CustomerInfoArgs struct {
	Name          string
	Email         string
	EmailText     pgtype.Text
	Phone         string
	Birthdate     string
	BirthdateDate pgtype.Date
	Cpf           string
}

func (args *CustomerInfoArgs) Validate() *UsecaseError {
	if !args.EmailText.Valid {
		if err := args.EmailText.Scan(args.Email); err != nil {
			return NewUnexpectedError(err)
		}
	}
	if args.Birthdate != "" {
		if err := DateFromString(&args.BirthdateDate, args.Birthdate); err != nil {
			return NewInvalidArgumentError(ACTION_MUTATION, "birthdate", ErrInvalidDate)
		}
	}
	if args.Name == "" {
		return NewInvalidArgumentError(ACTION_MUTATION, "name", ErrFieldIsRequired)
	}
	if args.Phone == "" {
		return NewInvalidArgumentError(ACTION_MUTATION, "phone", ErrFieldIsRequired)
	}
	if !validate.IsPhoneValid(args.Phone) {
		return NewInvalidArgumentError(ACTION_MUTATION, "phone", ErrInvalidPhone)
	}
	if args.Cpf == "" {
		return NewInvalidArgumentError(ACTION_MUTATION, "cpf", ErrFieldIsRequired)
	}
	if !validate.IsCpfValid(args.Cpf) {
		return NewInvalidArgumentError(ACTION_MUTATION, "cpf", ErrInvalidCpf)
	}
	if !validate.IsCpfValid(args.Cpf) {
		return NewInvalidArgumentError(ACTION_MUTATION, "cpf", ErrInvalidCpf)
	}
	if args.EmailText.String != "" {
		if args.EmailText.String == "" {
			return NewInvalidArgumentError(ACTION_MUTATION, "email", ErrFieldIsRequired)
		}
		if !validate.IsEmailValid(args.EmailText.String) {
			return NewInvalidArgumentError(ACTION_MUTATION, "email", ErrInvalidEmail)
		}
	}
	return nil
}

func CustomerWithPhoneExists(state State, phone string, exceptId pgtype.UUID) (bool, error) {
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
	exists, err := CustomerWithPhoneExists(state, args.Phone, pgtype.UUID{})
	if err != nil {
		return none, NewUnexpectedError(err)
	}
	if exists {
		return none, NewResourceAlreadyExistsError("customer", "phone")
	}
	id, err := NewUuid()
	if err != nil {
		return none, NewUnexpectedError(err)
	}

	params := infra.CreateCustomerParams{
		ID:        id,
		Name:      args.Name,
		Email:     args.EmailText,
		Phone:     args.Phone,
		Birthdate: args.BirthdateDate,
		Cpf:       args.Cpf,
	}
	customer, err := state.Queries().CreateCustomer(state.Context(), params)
	if err != nil {
		return none, NewUnexpectedError(err)
	}
	return customer, nil
}

func UpdateCustomer(state State, customerId pgtype.UUID, args CustomerInfoArgs) (infra.Customer, *UsecaseError) {
	var none infra.Customer
	exists, err := CustomerWithPhoneExists(state, args.Phone, customerId)
	if err != nil {
		return none, NewUnexpectedError(err)
	}
	if exists {
		return none, NewResourceAlreadyExistsError("customer", "phone")
	}
	params := infra.UpdateCustomerParams{
		ID:        customerId,
		Name:      args.Name,
		Email:     args.EmailText,
		Phone:     args.Phone,
		Birthdate: args.BirthdateDate,
		Cpf:       args.Cpf,
	}
	customer, err := state.Queries().UpdateCustomer(state.Context(), params)
	if err != nil {
		return customer, NewUnexpectedError(err)
	}
	return customer, nil
}
