package usecase

import (
	"backend/internal/domain"
	"backend/internal/infra"

	"github.com/google/uuid"
)

type UpdateAppointmentArgs struct {
	DateRaw   string
	Date      domain.Date
	TimeRaw   string
	Time      domain.Time
	StatusRaw int32
	Status    domain.AppointmentStatus
}

func (args *UpdateAppointmentArgs) Validate() *UsecaseError {
	if err := args.Date.Scan(args.DateRaw); err != nil {
		return NewInvalidArgumentError(err).InField("date")
	}
	if err := args.Time.Scan(args.TimeRaw); err != nil {
		return NewInvalidArgumentError(err).InField("time")
	}
	if err := args.Status.Scan(args.StatusRaw); err != nil {
		return NewInvalidArgumentError(err).InField("status")
	}

	return nil
}

func UpdateAppointment(state State, appointmentId uuid.UUID, args UpdateAppointmentArgs) (infra.Appointment, *UsecaseError) {
	var none infra.Appointment
	_, err := state.Queries().GetAppointmentByID(state.Context(), appointmentId)
	if ErrorIsNoRows(err) {
		return none, NewResourceNotFoundError("appointment")
	}
	if err != nil {
		return none, NewUnexpectedError(err)
	}

	params := infra.UpdateAppointmentParams{
		ID:     appointmentId,
		Date:   args.Date.Value,
		Time:   args.Time.Value,
		Status: args.StatusRaw,
	}
	appointment, err := state.Queries().UpdateAppointment(state.Context(), params)
	if err != nil {
		return none, NewUnexpectedError(err)
	}
	return appointment, nil
}
