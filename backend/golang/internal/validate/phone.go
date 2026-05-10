package validate

import (
	"regexp"
	"strings"
)

var phoneRegex = regexp.MustCompile(
	`^(?:\+?[1-9]\d{0,2}\s?)?(?:\(?\d{2}\)?\s?)?\d[\d\s-]{7,14}$`,
)

func IsPhoneValid(phone string) bool {
	phone = strings.TrimSpace(phone)

	if phone == "" {
		return false
	}

	if !phoneRegex.MatchString(phone) {
		return false
	}

	digits := regexp.MustCompile(`\D`).ReplaceAllString(phone, "")

	return len(digits) >= 8 && len(digits) <= 15
}
