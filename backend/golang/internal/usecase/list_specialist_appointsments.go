package usecase

import (
	"backend/internal/infra"

	"github.com/jackc/pgx/v5/pgtype"
)

type ListSpecialistAppointmentsArgs struct {
	SpecialistID    pgtype.UUID
	SpecialistIDRaw string
	DateRaw         string
}

func (args *ListSpecialistAppointmentsArgs) Validate() *UsecaseError {
	if !args.SpecialistID.Valid {
		if err := args.SpecialistID.Scan(args.SpecialistIDRaw); err != nil {
			return NewInvalidArgumentError(ACTION_QUERY, "specialistId", ErrInvalidUuid)
		}
	}

	return nil
}

func ListSpecialistAppointments(rs State, args ListSpecialistAppointmentsArgs) ([]infra.ListAppointmentsBySpecialistIDRow, *UsecaseError) {
	appointments, err := rs.Queries().ListAppointmentsBySpecialistID(rs.Context(), infra.ListAppointmentsBySpecialistIDParams{
		SpecialistId: args.SpecialistID,
		Date:         args.DateRaw,
	})
	if err != nil {
		return nil, NewUnexpectedError(err)
	}
	return appointments, nil
}
