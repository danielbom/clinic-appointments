package dtos

type HealthStatus string

const (
	HEALTH_UP       HealthStatus = "UP"
	HEALTH_DEGRADED HealthStatus = "DEGRADED"
	HEALTH_DOWN     HealthStatus = "DOWN"
)

type HealthLiveness struct {
	Status      HealthStatus `json:"status"`
	Environment string       `json:"environment"`
	Timestamp   string       `json:"timestamp"`
}

type HealthDatabase struct {
	Status    HealthStatus `json:"status"`
	LatencyMs int32        `json:"latencyMs"`

	Version           string `json:"version,omitempty"`
	MaxConnections    int32  `json:"maxConnections,omitempty"`
	OpenedConnections int32  `json:"openedConnections,omitempty"`
	SchemaVersion     int32  `json:"schemaVersion,omitempty"`
}

type HealthDetails struct {
	Database HealthDatabase `json:"database"`
}

type HealthCheck struct {
	Status      HealthStatus  `json:"status"`
	Environment string        `json:"environment"`
	Timestamp   string        `json:"timestamp"`
	Details     HealthDetails `json:"details,omitempty"`
}
