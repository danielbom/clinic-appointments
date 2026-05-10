package validate

import (
	"testing"
)

func TestIsEmailValid(t *testing.T) {
	tests := []struct {
		email string
		valid bool
	}{
		{"john@example.com", true},
		{"john.doe@gmail.com", true},
		{"john+tag@example.co.uk", true},
		{" foo@bar.com ", true},

		{"", false},
		{"plainaddress", false},
		{"@example.com", false},
		{"john@", false},
		{"john@example", false},
		{"john@@example.com", false},
		{"john example@example.com", false},
		{"john@example .com", false},
	}

	for _, tt := range tests {
		t.Run(tt.email, func(t *testing.T) {
			got := IsEmailValid(tt.email)

			if got != tt.valid {
				t.Errorf(
					"IsEmailValid(%q) = %v, want %v",
					tt.email,
					got,
					tt.valid,
				)
			}
		})
	}
}
