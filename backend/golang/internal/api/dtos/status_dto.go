package dtos

type Status struct {
	Status      bool   `json:"status"`
	Environment string `json:"environment"`
	Database    string `json:"database"`
}
