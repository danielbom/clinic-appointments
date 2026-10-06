package dtos

type InvoicesPreviewBody struct {
	SpecialistId string `json:"specialistId"`
	StartDate    string `json:"startDate"`
	EndDate      string `json:"endDate"`
}
