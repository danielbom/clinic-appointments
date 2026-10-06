package dtos

type TestDispatch struct {
	Kind    string `json:"kind"`
	Payload any    `json:"payload"`
}
