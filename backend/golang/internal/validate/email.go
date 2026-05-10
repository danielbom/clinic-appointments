package validate

import (
	"regexp"
	"strings"
)

var emailRegex = regexp.MustCompile(`^[^\s@]+@[^\s@]+\.[^\s@]+$`)

func IsEmailValid(email string) bool {
	email = strings.TrimSpace(email)

	if email == "" {
		return false
	}

	return emailRegex.MatchString(email)
}
