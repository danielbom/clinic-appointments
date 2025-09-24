package domain

import "testing"

func TestDateScan(t *testing.T) {
	tests := []struct {
		input    string
		expected bool
	}{
		{input: "", expected: false},
		{input: "2020-10-10", expected: true},
		{input: "2020-10-10T00:00:00Z", expected: false},
		{input: "2020-10-10.suffix", expected: false},
		{input: "prefix.2020-10-10", expected: false},
	}

	for _, test := range tests {
		var date Date
		date.Scan(test.input)
		result := date.IsDefined()
		if result != test.expected {
			t.Errorf("date.IsDefined(%v) = %v; want %v", test.input, result, test.expected)
		}
	}
}
