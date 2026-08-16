package usecase

import (
	"backend/internal/infra"

	"github.com/jackc/pgx/v5/pgtype"
)

type UpdateAppointmentStatusArgs struct {
	Status AppointmentStatus
}

func (args *UpdateAppointmentStatusArgs) Validate() *UsecaseError {
	if args.Status < 0 || args.Status >= AppointmentStatusCount {
		return NewInvalidArgumentError(ACTION_MUTATION, "status", ErrInvalidAppointmentStatus)
	}
	return nil
}

func UpdateAppointmentStatus(state State, appointmentId pgtype.UUID, args UpdateAppointmentStatusArgs) (infra.Appointment, *UsecaseError) {
	var none infra.Appointment
	row, err := state.Queries().GetAppointmentByID(state.Context(), appointmentId)
	if ErrorIsNoRows(err) {
		return none, NewNotFoundError("appointment")
	}
	if err != nil {
		return none, NewUnexpectedError(err)
	}

	if row.Status != int32(AppointmentStatusPending) {
		return none, NewInvalidStateTransitionError("appointment", AppointmentStatusToString(AppointmentStatus(row.Status)), AppointmentStatusToString(args.Status))
	}

	params := infra.UpdateAppointmentStatusParams{
		ID:     appointmentId,
		Status: int32(args.Status),
	}
	appointment, err := state.Queries().UpdateAppointmentStatus(state.Context(), params)
	if err != nil {
		return none, NewUnexpectedError(err)
	}
	return appointment, nil
}
