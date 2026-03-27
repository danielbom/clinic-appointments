package dtos

type Status struct {
	Status      bool           `json:"status"`
	UpdatedAt   string         `json:"updatedAt"`
	Environment string         `json:"environment"`
	Database    DatabaseStatus `json:"database"`
}

type DatabaseStatus struct {
	Status            string `json:"status"`
	Version           string `json:"version"`
	MaxConnections    int32  `json:"maxConnections"`
	OpenedConnections int32  `json:"openedConnections"`
	SchemaVersion     int32  `json:"schemaVersion"`
}
