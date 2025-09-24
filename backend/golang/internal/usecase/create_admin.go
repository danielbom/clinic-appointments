package usecase

import (
	"backend/internal/domain"
	"backend/internal/infra"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

const CreateAdminArgsName = "CreateAdminArgs"
const CreateAdminUsecaseName = "CreateAdminUsecase"

type CreateAdminArgs struct {
	Name     domain.String
	Email    domain.String
	Password domain.String
}

func (args *CreateAdminArgs) Validate() *UsecaseError {
	if err := args.Name.Required(); err != nil {
		return NewInvalidArgumentError(err).InField("name")
	}
	if err := args.Email.Required(); err != nil {
		return NewInvalidArgumentError(err).InField("email")
	}
	if err := args.Password.Required(); err != nil {
		return NewInvalidArgumentError(err).InField("password")
	}
	return nil
}

func CreateAdmin(state State, args CreateAdminArgs) (uuid.UUID, *UsecaseError) {
	_, err := state.Queries().GetIdentityByEmail(state.Context(), args.Email.Value)
	if err == nil {
		return uuid.Nil, NewResourceAlreadyExistsError("identity")
	} else if !ErrorIsNoRows(err) {
		return uuid.Nil, NewUnexpectedError(err)
	}

	params := infra.CreateAdminParams{
		Name:     args.Name.Value,
		Email:    args.Email.Value,
		Password: args.Password.Value,
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(params.Password), bcrypt.DefaultCost)
	if err != nil {
		return uuid.Nil, NewUnexpectedError(err)
	}
	params.Password = string(hashedPassword)

	id, err := state.Queries().CreateAdmin(state.Context(), params)
	if err != nil {
		return uuid.Nil, NewUnexpectedError(err)
	}
	return id, nil
}
