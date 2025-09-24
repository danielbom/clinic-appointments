package usecase

import (
	"backend/internal/domain"
	"backend/internal/infra"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

type CreateSpecialistHoursArgs struct {
	SpecialistIDRaw string
	SpecialistID    domain.UUID
	Weekday         domain.Weekday
	StartTimeRaw    string
	EndTimeRaw      string
	Interval        domain.TimeInterval
}

func (args *CreateSpecialistHoursArgs) Validate() *UsecaseError {
	if err := args.SpecialistID.Scan(args.SpecialistIDRaw); err != nil {
		return NewInvalidArgumentError(err).InField("specialistId")
	}
	if err := args.Interval.ScanStart(args.StartTimeRaw); err != nil {
		return NewInvalidArgumentError(err).InField("startTime")
	}
	if err := args.Interval.ScanEnd(args.EndTimeRaw); err != nil {
		return NewInvalidArgumentError(err).InField("endTime")
	}

	if err := args.Weekday.Validate(); err != nil {
		return NewInvalidArgumentError(err).InField("weekday")
	}
	if err := args.Interval.Validate(); err != nil {
		return NewInvalidArgumentError(err).InField("startTime and endTime")
	}

	return nil
}

func timeBetween(start, middle, end pgtype.Time) bool {
	return start.Microseconds <= middle.Microseconds && middle.Microseconds <= end.Microseconds
}

func timeInside(start1, start2, end2, end1 pgtype.Time) bool {
	return start1.Microseconds <= start2.Microseconds && end2.Microseconds <= end1.Microseconds
}

func CreateSpecialistHours(state State, args CreateSpecialistHoursArgs) (UsecaseOperation, uuid.UUID, *UsecaseError) {
	intersectingHours, err := state.Queries().ListSpecialistHoursIntersecting(state.Context(), infra.ListSpecialistHoursIntersectingParams{
		SpecialistID: args.SpecialistID.Value,
		Weekday:      args.Weekday.Value,
		StartTime:    args.Interval.StartTime(),
		EndTime:      args.Interval.EndTime(),
	})
	if err != nil {
		return OperationError, uuid.Nil, NewUnexpectedError(err)
	}

	if len(intersectingHours) > 0 {
		var inside bool = false
		var hourToUpdate *infra.SpecialistHour = nil
		for _, hour := range intersectingHours {
			if timeInside(hour.StartTime, args.Interval.StartTime(), args.Interval.EndTime(), hour.EndTime) {
				inside = true
				break
			}
			hourToUpdate = &hour
		}

		if inside {
			return OperationNoop, uuid.Nil, nil
		}

		if hourToUpdate == nil {
			return OperationError, uuid.Nil, NewUnexpectedError(ErrUnreachable)
		}

		params := infra.UpdateSpecialistHourStartAndEndTimeParams{
			ID: hourToUpdate.ID,
		}

		if timeBetween(hourToUpdate.StartTime, args.Interval.StartTime(), hourToUpdate.EndTime) {
			params.StartTime = hourToUpdate.StartTime
			params.EndTime = args.Interval.EndTime()
		} else if timeBetween(hourToUpdate.StartTime, args.Interval.EndTime(), hourToUpdate.EndTime) {
			params.StartTime = args.Interval.StartTime()
			params.EndTime = hourToUpdate.EndTime
		} else {
			return OperationError, uuid.Nil, NewUnexpectedError(ErrUnreachable)
		}

		err := state.Queries().UpdateSpecialistHourStartAndEndTime(state.Context(), params)
		if err != nil {
			return OperationError, uuid.Nil, NewUnexpectedError(err)
		}

		return OperationUpdate, hourToUpdate.ID, nil
	} else {
		params := infra.CreateSpecialistHourParams{
			SpecialistID: args.SpecialistID.Value,
			Weekday:      args.Weekday.Value,
			StartTime:    args.Interval.StartTime(),
			EndTime:      args.Interval.EndTime(),
		}
		id, err := state.Queries().CreateSpecialistHour(state.Context(), params)
		if err != nil {
			return OperationError, uuid.Nil, NewUnexpectedError(err)
		}
		return OperationCreate, id, nil
	}
}
