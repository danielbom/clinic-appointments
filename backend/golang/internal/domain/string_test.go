package domain

import (
	"testing"
)

func TestStringDefinedFalse(t *testing.T) {
	tests := []struct {
		input    string
		output   string
		expected bool
	}{
		{input: "", output: "", expected: false},
		{input: " ", output: " ", expected: true},
		{input: "a", output: "a", expected: true},
		{input: " a", output: " a", expected: true},
		{input: "", output: "", expected: false},
		{input: " ", output: "", expected: false},
		{input: "a", output: "a", expected: true},
		{input: " a", output: "a", expected: true},
	}
	for _, test := range tests {
		var str String
		str = StringNew(test.input)
		if str.Value != test.output {
			t.Errorf("StringNew(%v) = %v; want %v", test.input, str.Value, test.output)
			continue
		}
		defined := str.IsDefined()
		if defined != test.expected {
			t.Errorf("str.IsDefined(%v) = %v; want %v", test.input, defined, test.expected)
			continue
		}
		err := str.Required()
		if test.expected {
			if err != nil {
				t.Errorf("str.Required(%v) = %v; want nil", test.input, err)
			}
		} else {
			if err == nil {
				t.Errorf("str.Required(%v) = nil; want error", test.input)
			}
		}
	}
}
