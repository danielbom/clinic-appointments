package usecase

func GetStatus(state State) bool {
	_, err := state.Queries().GetStatus(state.Context())
	return err == nil
}
