package domain

import (
	"testing"
)

func TestUuidRequired(t *testing.T) {
	var uuid UUID
	if uuid.IsDefined() {
		t.Errorf("uuid.IsDefined() = true; want false")
	}
	if err := uuid.Required(); err == nil {
		t.Errorf("uuid.Required() = nil; want error")
	}
}
