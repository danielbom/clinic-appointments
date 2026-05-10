package validate

import "testing"

func TestIsPhoneValid(t *testing.T) {
	tests := []struct {
		phone string
		valid bool
	}{
		{"+55 (44) 99999-9999", true},
		{"(44) 99999-9999", true},
		{"44999999999", true},
		{"+1 650-555-1234", true},
		{"12345678", true},
		{"  +55 44999999999  ", true},

		{"", false},
		{"123", false},
		{"abc", false},
		{"+", false},
		{"(44)", false},
		{"9999", false},
		{"phone number", false},
		{"++55 44999999999", false},
		{"44-999", false},
	}

	for _, tt := range tests {
		t.Run(tt.phone, func(t *testing.T) {
			got := IsPhoneValid(tt.phone)

			if got != tt.valid {
				t.Errorf(
					"IsPhoneValid(%q) = %v, want %v",
					tt.phone,
					got,
					tt.valid,
				)
			}
		})
	}
}
