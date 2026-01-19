package infra

import (
	"context"
)

const getDbSettings = `-- name: GetDbSettings :one
SELECT
  current_setting('server_version') as version,
  current_setting('max_connections')::int as max_connections,
  (SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1) as opened_connections;
`

type DbSettings struct {
	Version           string
	MaxConnections    int32
	OpenedConnections int32
}

func (q *Queries) GetDbSettings(ctx context.Context, database string) (DbSettings, error) {
	row := q.db.QueryRow(ctx, getDbSettings, database)
	var s DbSettings
	err := row.Scan(&s.Version, &s.MaxConnections, &s.OpenedConnections)
	return s, err
}
