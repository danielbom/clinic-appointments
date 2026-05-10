package usecase

import (
	"backend/internal/infra"

	"github.com/jackc/pgx/v5/pgtype"
)

type CreateSpecialistHoursArgs struct {
	SpecialistIDRaw string
	SpecialistID    pgtype.UUID
	Weekday         int32
	StartTime       string
	StartTimeTime   pgtype.Time
	EndTime         string
	EndTimeTime     pgtype.Time
}

func (args *CreateSpecialistHoursArgs) Validate() *UsecaseError {
	if !args.SpecialistID.Valid {
		if err := args.SpecialistID.Scan(args.SpecialistIDRaw); err != nil {
			return NewInvalidArgumentError(ACTION_MUTATION, "specialistId", ErrInvalidUuid)
		}
	}
	if !args.StartTimeTime.Valid {
		if err := args.StartTimeTime.Scan(args.StartTime); err != nil {
			return NewInvalidArgumentError(ACTION_MUTATION, "startTime", ErrInvalidTime)
		}
	}
	if !args.EndTimeTime.Valid {
		if err := args.EndTimeTime.Scan(args.EndTime); err != nil {
			return NewInvalidArgumentError(ACTION_MUTATION, "endTime", ErrInvalidTime)
		}
	}

	if args.Weekday < 0 || args.Weekday > 6 {
		return NewInvalidArgumentError(ACTION_MUTATION, "weekday", ErrInvalidRange)
	}
	if args.StartTimeTime.Microseconds >= args.EndTimeTime.Microseconds {
		return NewInvalidArgumentError(ACTION_MUTATION, "startTime,endTime", ErrInvalidRange)
	}

	return nil
}

func timeBetween(start, middle, end pgtype.Time) bool {
	return start.Microseconds <= middle.Microseconds && middle.Microseconds <= end.Microseconds
}

func timeInside(start1, start2, end2, end1 pgtype.Time) bool {
	return start1.Microseconds <= start2.Microseconds && end2.Microseconds <= end1.Microseconds
}

func CreateSpecialistHours(state State, args CreateSpecialistHoursArgs) (UsecaseOperation, pgtype.UUID, *UsecaseError) {
	var none pgtype.UUID
	intersectingHours, err := state.Queries().ListSpecialistHoursIntersecting(state.Context(), infra.ListSpecialistHoursIntersectingParams{
		SpecialistId: args.SpecialistID,
		Weekday:      args.Weekday,
		StartTime:    args.StartTimeTime,
		EndTime:      args.EndTimeTime,
	})
	if err != nil {
		return OperationError, none, NewUnexpectedError(err)
	}

	if len(intersectingHours) > 0 {
		var inside bool = false
		var hourToUpdate *infra.SpecialistHour = nil
		for _, hour := range intersectingHours {
			if timeInside(hour.StartTime, args.StartTimeTime, args.EndTimeTime, hour.EndTime) {
				inside = true
				break
			}
			hourToUpdate = &hour
		}

		if inside {
			return OperationNoop, none, nil
		}

		if hourToUpdate == nil {
			return OperationError, none, NewUnreachableError("CreateSpecialistHours: hourToUpdate is nil")
		}

		params := infra.UpdateSpecialistHourStartAndEndTimeParams{
			SpecialistHoursId: hourToUpdate.ID,
		}

		if timeBetween(hourToUpdate.StartTime, args.StartTimeTime, hourToUpdate.EndTime) {
			params.StartTime = hourToUpdate.StartTime
			params.EndTime = args.EndTimeTime
		} else if timeBetween(hourToUpdate.StartTime, args.EndTimeTime, hourToUpdate.EndTime) {
			params.StartTime = args.StartTimeTime
			params.EndTime = hourToUpdate.EndTime
		} else {
			return OperationError, none, NewUnreachableError("CreateSpecialistHours: invalid inside constraint")
		}

		err := state.Queries().UpdateSpecialistHourStartAndEndTime(state.Context(), params)
		if err != nil {
			return OperationError, none, NewUnexpectedError(err)
		}

		return OperationUpdate, hourToUpdate.ID, nil
	} else {
		id, err := NewUuid()
		if err != nil {
			return OperationError, none, NewUnexpectedError(err)
		}

		params := infra.CreateSpecialistHourParams{
			ID:           id,
			SpecialistId: args.SpecialistID,
			Weekday:      args.Weekday,
			StartTime:    args.StartTimeTime,
			EndTime:      args.EndTimeTime,
		}
		_, err = state.Queries().CreateSpecialistHour(state.Context(), params)
		if err != nil {
			return OperationError, none, NewUnexpectedError(err)
		}
		return OperationCreate, id, nil
	}
}
