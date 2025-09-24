package domain

type Weekday struct {
	Value int32
}

func NewWeekday(value int32) Weekday {
	return Weekday{Value: value}
}

func (w Weekday) Validate() error {
	if w.Value < 0 || w.Value > 6 {
		return ErrInvalidWeekday
	}
	return nil
}
