package usecase

import (
	"backend/internal/infra"

	"github.com/jackc/pgx/v5/pgtype"
)

type CreateAppointmentArgs struct {
	CustomerIDRaw    string
	CustomerID       pgtype.UUID
	ServiceIDRaw     string
	ServiceID        pgtype.UUID
	ServiceNameIDRaw string
	ServiceNameID    pgtype.UUID
	SpecialistIDRaw  string
	SpecialistID     pgtype.UUID
	DateRaw          string
	Date             pgtype.Date
	TimeRaw          string
	Time             pgtype.Time
	Status           int32
}

func (args *CreateAppointmentArgs) Validate() *UsecaseError {
	if !args.ServiceID.Valid && args.ServiceIDRaw != "" {
		if err := args.ServiceID.Scan(args.ServiceIDRaw); err != nil {
			return NewInvalidArgumentError(ErrInvalidUuid).InField("serviceId")
		}
	}
	if !args.SpecialistID.Valid && args.SpecialistIDRaw != "" {
		if err := args.SpecialistID.Scan(args.SpecialistIDRaw); err != nil {
			return NewInvalidArgumentError(ErrInvalidUuid).InField("specialistId")
		}
	}
	if !args.ServiceNameID.Valid && args.ServiceNameIDRaw != "" {
		if err := args.ServiceNameID.Scan(args.ServiceNameIDRaw); err != nil {
			return NewInvalidArgumentError(ErrInvalidUuid).InField("serviceNameId")
		}
	}
	if !args.CustomerID.Valid && args.CustomerIDRaw != "" {
		if err := args.CustomerID.Scan(args.CustomerIDRaw); err != nil {
			return NewInvalidArgumentError(ErrInvalidUuid).InField("customerId")
		}
	}
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
	if !args.ServiceNameID.Valid || !args.SpecialistID.Valid {
		if !args.ServiceID.Valid {
			return NewInvalidArgumentError(ErrFieldIsRequired).InField("serviceId")
		}
	}
	if !args.CustomerID.Valid {
		return NewInvalidArgumentError(ErrFieldIsRequired).InField("customerId")
	}

	return nil
}

func CreateAppointment(state State, args CreateAppointmentArgs) (pgtype.UUID, *UsecaseError) {
	var none pgtype.UUID
	var service infra.Service

	if !args.ServiceID.Valid {
		maybeService, err := state.Queries().GetService(state.Context(), infra.GetServiceParams{
			ServiceNameId: args.ServiceNameID,
			SpecialistId:  args.SpecialistID,
		})
		if ErrorIsNoRows(err) {
			return none, NewNotFoundError(ErrResourceNotFound).InField("service")
		}
		if err != nil {
			return none, NewUnexpectedError(err)
		}
		service = maybeService
	} else {
		maybeService, err := state.Queries().GetServiceByID(state.Context(), args.ServiceID)
		if ErrorIsNoRows(err) {
			return none, NewNotFoundError(ErrResourceNotFound).InField("service")
		}
		if err != nil {
			return none, NewUnexpectedError(err)
		}
		service = maybeService
	}

	// filter correct intersect status
	appointmentsIntersects, err := state.Queries().AppointmentsIntersects(state.Context(), infra.AppointmentsIntersectsParams{
		Date:         args.Date,
		Time:         args.Time,
		Duration:     service.Duration,
		SpecialistId: service.SpecialistID,
	})
	if err != nil {
		return none, NewUnexpectedError(err)
	}
	if appointmentsIntersects {
		return none, NewInvalidStateError(ErrAppointmentsIntersection)
	}

	id, err := NewUuid()
	if err != nil {
		return none, NewUnexpectedError(err)
	}

	params := infra.CreateAppointmentParams{
		ID:            id,
		CustomerId:    args.CustomerID,
		SpecialistId:  service.SpecialistID,
		ServiceNameId: service.ServiceNameID,
		Price:         service.Price,
		Duration:      service.Duration,
		Date:          args.Date,
		Time:          args.Time,
		Status:        args.Status,
	}
	_, err = state.Queries().CreateAppointment(state.Context(), params)
	if err != nil {
		return none, NewUnexpectedError(err)
	}
	return id, nil
}
