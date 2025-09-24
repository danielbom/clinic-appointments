package domain

type AppointmentStatus int32

const (
	AppointmentStatusNone AppointmentStatus = iota
	AppointmentStatusPending
	AppointmentStatusRealized
	AppointmentStatusCanceled
	AppointmentStatusCount
)

func (s *AppointmentStatus) Scan(value int32) error {
	*s = AppointmentStatus(value)
	return s.Validate()
}

func (s AppointmentStatus) Validate() error {
	value := int32(s)
	if value < 0 || value >= int32(AppointmentStatusCount) {
		return ErrInvalidAppointmentStatus
	}
	return nil
}
