package usecase

import (
	"backend/internal/infra"
)

type CountSpecialistArgs struct {
	Cpf   string
	Cnpj  string
	Phone string
	Name  string
}

func (args *CountSpecialistArgs) Validate() *UsecaseError {
	return nil
}

func CountSpecialists(state State, args CountSpecialistArgs) (int32, *UsecaseError) {
	count, err := state.Queries().CountSpecialists(state.Context(), infra.CountSpecialistsParams{
		Name:  args.Name,
		Cpf:   args.Cpf,
		Cnpj:  args.Cnpj,
		Phone: args.Phone,
	})
	if err == nil {
		return count, nil
	}
	return 0, NewUnexpectedError(err)
}
