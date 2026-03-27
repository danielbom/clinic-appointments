package domain

import (
	"testing"
)

func TestTimeScan(t *testing.T) {
	tests := []struct {
		input    string
		expected bool
		hour     int
		minute   int
		second   int
	}{
		{input: "", expected: false},
		{input: "00:00:00.suffix", expected: false},
		{input: "prefix.00:00:00", expected: false},
		{input: "00:00:20", expected: true, minute: 0, second: 20},
		{input: "00:10:20", expected: true, hour: 0, minute: 10, second: 20},
		{input: "12:10:20", expected: true, hour: 12, minute: 10, second: 20},
	}

	for _, test := range tests {
		var time Time
		time.Scan(test.input)
		{
			result := time.IsDefined()
			if result != test.expected {
				t.Errorf("date.IsDefined(%v) = %v; want %v", test.input, result, test.expected)
				continue
			}
		}
		if !test.expected {
			continue
		}
		{
			result := time.Hour()
			if result != test.hour {
				t.Errorf("date.Hour(%v) = %v; want %v", test.input, result, test.hour)
				continue
			}
		}
		{
			result := time.Minutes()
			if result != test.minute {
				t.Errorf("date.Minutes(%v) = %v; want %v", test.input, result, test.minute)
				continue
			}
		}
		{
			result := time.Seconds()
			if result != test.second {
				t.Errorf("date.Seconds(%v) = %v; want %v", test.input, result, test.second)
				continue
			}
		}
	}
}

func TestTimeIsAfter(t *testing.T) {
	tests := []struct {
		fst      string
		snd      string
		expected bool
	}{
		{fst: "12:00:00", snd: "09:00:00", expected: true},
		{fst: "12:00:00", snd: "12:00:00", expected: true},
		{fst: "12:00:00", snd: "19:00:00", expected: false},
	}

	for _, test := range tests {
		var fst, snd Time
		if err := fst.Scan(test.fst); err != nil {
			panic(err)
		}
		if err := snd.Scan(test.snd); err != nil {
			panic(err)
		}
		result := fst.IsAfter(snd)
		if result != test.expected {
			t.Errorf("date.IsAfter(%v, %v) = %v; want %v", test.fst, test.snd, result, test.expected)
			continue
		}
	}
}

func TestTimeIsBefore(t *testing.T) {
	tests := []struct {
		fst      string
		snd      string
		expected bool
	}{
		{fst: "12:00:00", snd: "09:00:00", expected: false},
		{fst: "12:00:00", snd: "12:00:00", expected: true},
		{fst: "12:00:00", snd: "19:00:00", expected: true},
	}

	for _, test := range tests {
		var fst, snd Time
		if err := fst.Scan(test.fst); err != nil {
			panic(err)
		}
		if err := snd.Scan(test.snd); err != nil {
			panic(err)
		}
		result := fst.IsBefore(snd)
		if result != test.expected {
			t.Errorf("date.IsBefore(%v, %v) = %v; want %v", test.fst, test.snd, result, test.expected)
			continue
		}
	}
}
