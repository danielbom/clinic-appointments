package usecase

import (
	"backend/internal/infra"

	"github.com/jackc/pgx/v5/pgtype"
)

type UpdateAppointmentArgs struct {
	Date     string
	DateDate pgtype.Date
	Time     string
	TimeTime pgtype.Time
	Status   int32
}

func (args *UpdateAppointmentArgs) Validate() *UsecaseError {
	if !args.DateDate.Valid {
		if err := args.DateDate.Scan(args.Date); err != nil {
			return NewInvalidArgumentError(ACTION_MUTATION, "date", ErrInvalidDate)
		}
	}
	if !args.TimeTime.Valid {
		if err := args.TimeTime.Scan(args.Time); err != nil {
			return NewInvalidArgumentError(ACTION_MUTATION, "time", ErrInvalidTime)
		}
	}
	if args.Status < 0 || args.Status >= int32(AppointmentStatusCount) {
		return NewInvalidArgumentError(ACTION_MUTATION, "status", ErrInvalidAppointmentStatus)
	}

	return nil
}

func UpdateAppointment(state State, appointmentId pgtype.UUID, args UpdateAppointmentArgs) (infra.Appointment, *UsecaseError) {
	var none infra.Appointment
	_, err := state.Queries().GetAppointmentByID(state.Context(), appointmentId)
	if ErrorIsNoRows(err) {
		return none, NewNotFoundError("appointment")
	}
	if err != nil {
		return none, NewUnexpectedError(err)
	}

	params := infra.UpdateAppointmentParams{
		ID:     appointmentId,
		Date:   args.DateDate,
		Time:   args.TimeTime,
		Status: args.Status,
	}
	appointment, err := state.Queries().UpdateAppointment(state.Context(), params)
	if err != nil {
		return none, NewUnexpectedError(err)
	}
	return appointment, nil
}
