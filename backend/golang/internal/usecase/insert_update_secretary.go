package usecase

import (
	"backend/internal/domain"
	"backend/internal/infra"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type SecretaryInfoArgs struct {
	Name         domain.String
	Email        domain.String
	Phone        domain.String
	Password     domain.String
	BirthdateRaw string
	Birthdate    domain.Date
	Cpf          domain.String
	Cnpj         domain.String
	CnpjText     domain.String
	Update       bool
}

func (args *SecretaryInfoArgs) Validate() *UsecaseError {
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
	if err := args.Cnpj.Required(); err != nil {
		return NewInvalidArgumentError(err).InField("cnpj")
	}
	if err := args.Cnpj.Required(); err != nil {
		return NewInvalidArgumentError(err).InField("cnpj")
	}
	if err := args.Cnpj.IsCnpj(); err != nil {
		return NewInvalidArgumentError(err).InField("cnpj")
	}
	if args.Update {
		if args.Password.IsDefined() {
			if err := args.Password.IsPassword(); err != nil {
				return NewInvalidArgumentError(err).InField("password")
			}
		}
	} else {
		if err := args.Password.Required(); err != nil {
			return NewInvalidArgumentError(err).InField("password")
		}
		if err := args.Password.IsPassword(); err != nil {
			return NewInvalidArgumentError(err).InField("password")
		}
	}
	return nil
}

func SecretaryWithEmailExists(state State, email string, exceptId uuid.UUID) (infra.Secretary, bool, error) {
	secretary, err := state.Queries().GetSecretaryByEmail(state.Context(), email)
	if ErrorIsNoRows(err) {
		return secretary, false, nil
	}
	if err != nil {
		return secretary, false, err
	}
	if secretary.ID == exceptId {
		return secretary, false, nil
	}
	return secretary, true, nil
}

func CreateSecretary(state State, args SecretaryInfoArgs) (infra.Secretary, *UsecaseError) {
	var none infra.Secretary
	_, exists, err := SecretaryWithEmailExists(state, args.Email.Value, uuid.Nil)
	if err != nil {
		return none, NewUnexpectedError(err)
	}
	if exists {
		return none, NewResourceAlreadyExistsError("secretary.email")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(args.Password.Value), bcrypt.DefaultCost)
	if err != nil {
		return none, NewUnexpectedError(err)
	}
	args.Password.Value = string(hashedPassword)

	params := infra.CreateSecretaryParams{
		Name:      args.Name.Value,
		Email:     args.Email.Value,
		Phone:     args.Phone.Value,
		Birthdate: args.Birthdate.Value,
		Cpf:       args.Cpf.Value,
		Cnpj:      args.Cnpj.Text(),
		Password:  args.Password.Value,
	}
	secretary, err := state.Queries().CreateSecretary(state.Context(), params)
	if err != nil {
		return none, NewUnexpectedError(err)
	}
	return secretary, nil
}

func UpdateSecretary(state State, secretaryId uuid.UUID, args SecretaryInfoArgs) (infra.Secretary, *UsecaseError) {
	var none infra.Secretary
	secretary0, exists, err := SecretaryWithEmailExists(state, args.Email.Value, secretaryId)
	if err != nil {
		return none, NewUnexpectedError(err)
	}
	if exists {
		return none, NewResourceAlreadyExistsError("secretary.email")
	}

	if args.Password.IsDefined() {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(args.Password.Value), bcrypt.DefaultCost)
		if err != nil {
			return none, NewUnexpectedError(err)
		}
		args.Password.Value = string(hashedPassword)
	} else {
		args.Password.Value = secretary0.Password
	}

	params := infra.UpdateSecretaryParams{
		ID:        secretaryId,
		Name:      args.Name.Value,
		Email:     args.Email.Value,
		Phone:     args.Phone.Value,
		Birthdate: args.Birthdate.Value,
		Cpf:       args.Cpf.Value,
		Cnpj:      args.Cnpj.Text(),
		Password:  args.Password.Value,
	}
	secretary, err := state.Queries().UpdateSecretary(state.Context(), params)
	if err != nil {
		return secretary, NewUnexpectedError(err)
	}
	return secretary, nil
}
