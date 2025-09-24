package usecase

import (
	"backend/internal/domain"
	"backend/internal/infra"

	"github.com/google/uuid"
)

type CreateAppointmentArgs struct {
	CustomerIDRaw    string
	CustomerID       domain.UUID
	ServiceIDRaw     string
	ServiceID        domain.UUID
	ServiceNameIDRaw string
	ServiceNameID    domain.UUID
	SpecialistIDRaw  string
	SpecialistID     domain.UUID
	DateRaw          string
	Date             domain.Date
	TimeRaw          string
	Time             domain.Time
	StatusRaw        int32
	Status           domain.AppointmentStatus
}

func (args *CreateAppointmentArgs) Validate() *UsecaseError {
	if err := args.ServiceID.ScanOptional(args.ServiceIDRaw); err != nil {
		return NewInvalidArgumentError(err).InField("serviceId")
	}
	if !args.ServiceID.IsDefined() {
		if err := args.SpecialistID.Scan(args.SpecialistIDRaw); err != nil {
			return NewInvalidArgumentError(err).InField("specialistId")
		}
		if err := args.ServiceNameID.Scan(args.ServiceNameIDRaw); err != nil {
			return NewInvalidArgumentError(err).InField("serviceNameId")
		}
	}
	if err := args.CustomerID.Scan(args.CustomerIDRaw); err != nil {
		return NewInvalidArgumentError(err).InField("customerId")
	}
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

func CreateAppointment(state State, args CreateAppointmentArgs) (uuid.UUID, *UsecaseError) {
	var service infra.Service

	if !args.ServiceID.IsDefined() {
		maybeService, err := state.Queries().GetService(state.Context(), infra.GetServiceParams{
			ServiceNameID: args.ServiceNameID.Value,
			SpecialistID:  args.SpecialistID.Value,
		})
		if ErrorIsNoRows(err) {
			return uuid.Nil, NewResourceNotFoundError("service")
		}
		if err != nil {
			return uuid.Nil, NewUnexpectedError(err)
		}
		service = maybeService
	} else {
		maybeService, err := state.Queries().GetServiceByID(state.Context(), args.ServiceID.Value)
		if ErrorIsNoRows(err) {
			return uuid.Nil, NewResourceNotFoundError("service")
		}
		if err != nil {
			return uuid.Nil, NewUnexpectedError(err)
		}
		service = maybeService
	}

	// filter correct intersect status
	appointmentsIntersects, err := state.Queries().AppointmentsIntersects(state.Context(), infra.AppointmentsIntersectsParams{
		Date:         args.Date.Value,
		Time:         args.Time.Value,
		Duration:     service.Duration,
		SpecialistID: service.SpecialistID,
	})
	if err != nil {
		return uuid.Nil, NewUnexpectedError(err)
	}
	if appointmentsIntersects {
		return uuid.Nil, NewInvalidStateError(ErrAppointmentsIntersection)
	}

	params := infra.CreateAppointmentParams{
		CustomerID:    args.CustomerID.Value,
		SpecialistID:  service.SpecialistID,
		ServiceNameID: service.ServiceNameID,
		Price:         service.Price,
		Duration:      service.Duration,
		Date:          args.Date.Value,
		Time:          args.Time.Value,
		Status:        int32(args.Status),
	}
	id, err := state.Queries().CreateAppointment(state.Context(), params)
	if err != nil {
		return uuid.Nil, NewUnexpectedError(err)
	}
	return id, nil
}
