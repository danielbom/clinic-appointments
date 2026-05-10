package usecase

import (
	"backend/internal/infra"
	"backend/internal/validate"

	"github.com/jackc/pgx/v5/pgtype"

	"golang.org/x/crypto/bcrypt"
)

const CreateAdminArgsName = "CreateAdminArgs"
const CreateAdminUsecaseName = "CreateAdminUsecase"

type CreateAdminArgs struct {
	Name     string
	Email    string
	Password string
}

func (args *CreateAdminArgs) Validate() *UsecaseError {
	if args.Name == "" {
		return NewInvalidArgumentError(ACTION_MUTATION, "name", ErrFieldIsRequired)
	}
	if args.Email == "" {
		return NewInvalidArgumentError(ACTION_MUTATION, "email", ErrFieldIsRequired)
	}
	if !validate.IsEmailValid(args.Email) {
		return NewInvalidArgumentError(ACTION_MUTATION, "email", ErrInvalidEmail)
	}
	if args.Password == "" {
		return NewInvalidArgumentError(ACTION_MUTATION, "password", ErrFieldIsRequired)
	}
	if !validate.IsPasswordValid(args.Email) {
		return NewInvalidArgumentError(ACTION_MUTATION, "password", ErrInvalidPattern)
	}
	return nil
}

func CreateAdmin(state State, args CreateAdminArgs) (pgtype.UUID, *UsecaseError) {
	var none pgtype.UUID
	_, err := state.Queries().GetIdentityByEmail(state.Context(), args.Email)
	if err == nil {
		return none, NewResourceAlreadyExistsError("identity", "email")
	} else if !ErrorIsNoRows(err) {
		return none, NewUnexpectedError(err)
	}

	id, err := NewUuid()
	if err != nil {
		return none, NewUnexpectedError(err)
	}

	params := infra.CreateAdminParams{
		ID:       id,
		Name:     args.Name,
		Email:    args.Email,
		Password: args.Password,
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(params.Password), bcrypt.DefaultCost)
	if err != nil {
		return none, NewUnexpectedError(err)
	}
	params.Password = string(hashedPassword)

	_, err = state.Queries().CreateAdmin(state.Context(), params)
	if err != nil {
		return none, NewUnexpectedError(err)
	}
	return id, nil
}
