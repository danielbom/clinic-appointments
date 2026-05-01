package dtos

type ProblemSource struct {
	In   string `json:"in"`
	Path string `json:"path"`
}

type ProblemDetails struct {
	Code     string              `json:"code"`
	Type     string              `json:"type"`
	Title    string              `json:"title"`
	Detail   string              `json:"detail,omitempty"`
	Status   int                 `json:"status"`
	Source   *ProblemSource      `json:"source,omitempty"`
	Errors   map[string][]string `json:"errors,omitempty"`
	Instance string              `json:"instance,omitempty"`
	TraceId  string              `json:"traceId,omitempty"`
}
