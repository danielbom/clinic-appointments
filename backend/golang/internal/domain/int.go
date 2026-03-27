package domain

type Int int32

func (d Int) Positive() error {
	value := int32(d)
	if value < 0 {
		return ErrExpectPositiveInteger
	}
	return nil
}

func (d Int) Negative() error {
	value := int32(d)
	if value > 0 {
		return ErrExpectNegativeInteger
	}
	return nil
}

type Nat int32

func (d Nat) Validate() error {
	value := int32(d)
	if value <= 0 {
		return ErrExpectPositiveInteger
	}
	return nil
}
