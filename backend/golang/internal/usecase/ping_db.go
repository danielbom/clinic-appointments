package usecase

func PingDb(state State) (int32, error) {
	return state.Queries().Ping(state.Context())
}
