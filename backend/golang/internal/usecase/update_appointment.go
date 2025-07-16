package usecase

import (
	"backend/internal/infra"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

type UpdateAppointmentArgs struct {
	DateRaw string
	Date    pgtype.Date
	TimeRaw string
	Time    pgtype.Time
	Status  int32
}

func (args *UpdateAppointmentArgs) Validate() *UsecaseError {
	if !args.Date.Valid {
		if err := args.Date.Scan(args.DateRaw); err != nil {
			return NewInvalidArgumentError(ErrInvalidDate).InField("date")
		}
	}
	if !args.Time.Valid {
		if err := args.Time.Scan(args.TimeRaw); err != nil {
			return NewInvalidArgumentError(ErrInvalidTime).InField("time")
		}
	}
	if args.Status < 0 || args.Status >= int32(AppointmentStatusCount) {
		return NewInvalidArgumentError(ErrInvalidAppointmentStatus).InField("status")
	}

	return nil
}

func UpdateAppointment(state State, appointmentId uuid.UUID, args UpdateAppointmentArgs) (infra.Appointment, *UsecaseError) {
	var none infra.Appointment
	_, err := state.Queries().GetAppointmentByID(state.Context(), appointmentId)
	if ErrorIsNoRows(err) {
		// TODO: Check this path
		return none, NewNotFoundError(ErrResourceNotFound).InField("appointment")
	}
	if err != nil {
		return none, NewUnexpectedError(err)
	}

	params := infra.UpdateAppointmentParams{
		ID:     appointmentId,
		Date:   args.Date,
		Time:   args.Time,
		Status: args.Status,
	}
	appointment, err := state.Queries().UpdateAppointment(state.Context(), params)
	if err != nil {
		return none, NewUnexpectedError(err)
	}
	return appointment, nil
}
