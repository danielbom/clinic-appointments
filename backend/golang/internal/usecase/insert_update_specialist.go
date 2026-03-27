package usecase

import (
	"backend/internal/domain"
	"backend/internal/infra"

	"github.com/google/uuid"
)

type SpecialistInfoArgs struct {
	Name         domain.String
	Email        domain.String
	Phone        domain.String
	BirthdateRaw string
	Birthdate    domain.Date
	Cpf          domain.String
	Cnpj         domain.String
}

func (args *SpecialistInfoArgs) Validate() *UsecaseError {
	if err := args.Birthdate.Scan(args.BirthdateRaw); err != nil {
		return NewInvalidArgumentError(err).InField("birthdate")
	}
	if err := args.Name.Required(); err != nil {
		return NewInvalidArgumentError(err).InField("name")
	}
	if err := args.Email.Required(); err != nil {
		return NewInvalidArgumentError(err).InField("email")
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
	if args.Cnpj.IsDefined() {
		if err := args.Cnpj.IsCnpj(); err != nil {
			return NewInvalidArgumentError(err).InField("cnpj")
		}
	}
	return nil
}

func ServiceWithEmailExists(state State, email string, exceptId uuid.UUID) (bool, error) {
	specialist, err := state.Queries().GetSpecialistByEmail(state.Context(), email)
	if ErrorIsNoRows(err) {
		return false, nil
	}
	if err != nil {
		return false, err
	}
	if specialist.ID == exceptId {
		return false, nil
	}
	return true, nil
}

func CreateSpecialist(state State, args SpecialistInfoArgs) (uuid.UUID, *UsecaseError) {
	exists, err := ServiceWithEmailExists(state, args.Email.Value, uuid.Nil)
	if err != nil {
		return uuid.Nil, NewUnexpectedError(err)
	}
	if exists {
		return uuid.Nil, NewResourceAlreadyExistsError("specialist.email")
	}

	params := infra.CreateSpecialistParams{
		Name:      args.Name.Value,
		Email:     args.Email.Value,
		Phone:     args.Phone.Value,
		Birthdate: args.Birthdate.Value,
		Cpf:       args.Cpf.Value,
		Cnpj:      args.Cnpj.Text(),
	}
	id, err := state.Queries().CreateSpecialist(state.Context(), params)
	if err != nil {
		return uuid.Nil, NewUnexpectedError(err)
	}
	return id, nil
}

func UpdateSpecialist(state State, specialistId uuid.UUID, args SpecialistInfoArgs) (infra.Specialist, *UsecaseError) {
	var none infra.Specialist
	exists, err := ServiceWithEmailExists(state, args.Email.Value, specialistId)
	if err != nil {
		return none, NewUnexpectedError(err)
	}
	if exists {
		return none, NewResourceAlreadyExistsError("specialist.email")
	}
	params := infra.UpdateSpecialistParams{
		ID:        specialistId,
		Name:      args.Name.Value,
		Email:     args.Email.Value,
		Phone:     args.Phone.Value,
		Birthdate: args.Birthdate.Value,
		Cpf:       args.Cpf.Value,
		Cnpj:      args.Cnpj.Text(),
	}
	specialist, err := state.Queries().UpdateSpecialist(state.Context(), params)
	if err != nil {
		return specialist, NewUnexpectedError(err)
	}
	return specialist, nil
}
