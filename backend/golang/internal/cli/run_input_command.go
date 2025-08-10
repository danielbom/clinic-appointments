package cli

import (
	"bufio"
	"fmt"
	"log"
	"os"
	"strings"

	"backend/internal/usecase"
)

func extractOnlyDigits(cpf string) string {
	var sb strings.Builder
	for _, r := range cpf {
		if r >= '0' && r <= '9' {
			sb.WriteRune(r)
		}
	}
	return sb.String()
}

func optionalValue(value string) string {
	if value == "-" {
		return ""
	}
	return value
}

func parseDate(date string) (string, bool) {
	// input: <LongMonth> <Day>, <FullYear>
	// output: <FullYear>-<Month>-<Day>
	var longMonth string
	var day, fullYear int
	_, err := fmt.Sscanf(date, "%s %d, %d", &longMonth, &day, &fullYear)
	if err != nil {
		return "", false
	}

	month := ""
	switch longMonth {
	case "January":
		month = "01"
	case "February":
		month = "02"
	case "March":
		month = "03"
	case "April":
		month = "04"
	case "May":
		month = "05"
	case "June":
		month = "06"
	case "July":
		month = "07"
	case "August":
		month = "08"
	case "September":
		month = "09"
	case "October":
		month = "10"
	case "November":
		month = "11"
	case "December":
		month = "12"
	}

	return fmt.Sprintf("%d-%s-%02d", fullYear, month, day), true
}

func parseWeekday(weekday string) (int32, bool) {
	switch weekday {
	case "Sunday":
		return 0, true
	case "Monday":
		return 1, true
	case "Tuesday":
		return 2, true
	case "Wednesday":
		return 3, true
	case "Thursday":
		return 4, true
	case "Friday":
		return 5, true
	case "Saturday":
		return 6, true
	}
	return 0, false
}

func parseTime(time string) (string, bool) {
	// input: <Hour24>:<Minute>
	// output: <Hour24>:<Minute>:00
	var hour24, minute int
	_, err := fmt.Sscanf(time, "%d:%d", &hour24, &minute)
	if err != nil {
		return "", false
	}
	return fmt.Sprintf("%02d:%02d:00", hour24, minute), true
}

func parseDuration(duration string) (int, bool) {
	// input: <Minute>
	// output: 00:<Minute>:00
	var minute int
	n, err := fmt.Sscanf(duration, "%d", &minute)
	if err != nil || n != 1 || 0 >= minute {
		return 0, false
	}
	return minute, true
}

func parsePrice(price string) (int32, bool) {
	// input: R$ <Value>,<Cents>
	// output: cents
	var value, cents int32
	_, err := fmt.Sscanf(price, "R$ %d,%d", &value, &cents)
	if err != nil {
		return 0, false
	}
	return value*100 + cents, true
}

type RunInputCommand struct {
	lineNumber int
	wait       bool
}

func (c *RunInputCommand) Name() string {
	return "run-input"
}

func (c *RunInputCommand) Init() {}

func (c *RunInputCommand) Parse(args []string) {}

func (c *RunInputCommand) Usage() {}

func (c *RunInputCommand) Help() {
	fmt.Println("run-input")
}

func (c *RunInputCommand) nextLine(scanner *bufio.Scanner) (string, bool) {
	c.lineNumber++
	if !scanner.Scan() {
		c.wait = true
		return "", false
	}
	return strings.TrimSpace(scanner.Text()), true
}

func (r *RunInputCommand) runCreateAdmin(s *State, scanner *bufio.Scanner) error {
	args := usecase.CreateAdminArgs{}
	var found bool
	args.Name, found = r.nextLine(scanner)
	if !found {
		return fmt.Errorf("missing name")
	}
	args.Email, found = r.nextLine(scanner)
	if !found {
		return fmt.Errorf("missing email")
	}
	args.Password, found = r.nextLine(scanner)
	if !found {
		return fmt.Errorf("missing password")
	}

	if _, err := usecase.CreateAdmin(s, args); err != nil {
		return err.Error
	} else {
		log.Printf("Admin created with name: %s", args.Name)
		return nil
	}
}

func (r *RunInputCommand) runCreateSecretary(s *State, scanner *bufio.Scanner) error {
	args := usecase.SecretaryInfoArgs{}
	var found bool
	args.Name, found = r.nextLine(scanner)
	if !found {
		return fmt.Errorf("missing name")
	}
	args.Email, found = r.nextLine(scanner)
	if !found {
		return fmt.Errorf("missing email")
	}
	args.Password, found = r.nextLine(scanner)
	if !found {
		return fmt.Errorf("missing password")
	}
	args.Phone, found = r.nextLine(scanner)
	if !found {
		return fmt.Errorf("missing phone")
	}
	args.Birthdate, found = r.nextLine(scanner)
	if !found {
		return fmt.Errorf("missing birthdate")
	}
	args.Cpf, found = r.nextLine(scanner)
	if !found {
		return fmt.Errorf("missing cpf")
	}
	args.Cnpj, found = r.nextLine(scanner)
	if !found {
		return fmt.Errorf("missing cnpj")
	}

	args.Phone = extractOnlyDigits(args.Phone)
	args.Birthdate, found = parseDate(args.Birthdate)
	if !found {
		return fmt.Errorf("invalid birthdate format")
	}
	args.Cpf = extractOnlyDigits(args.Cpf)
	args.Cnpj = extractOnlyDigits(optionalValue(args.Cnpj))

	if err := args.Validate(); err != nil {
		return err.Error
	}

	if _, err := usecase.CreateSecretary(s, args); err != nil {
		return err.Error
	} else {
		log.Printf("Secretary created with name: %s", args.Name)
		return nil
	}
}

func (r *RunInputCommand) runCreateCustomer(s *State, scanner *bufio.Scanner) error {
	var args usecase.CustomerInfoArgs
	var found bool
	args.Name, found = r.nextLine(scanner)
	if !found {
		return fmt.Errorf("missing name")
	}
	args.Email, found = r.nextLine(scanner)
	if !found {
		return fmt.Errorf("missing email")
	}
	args.Phone, found = r.nextLine(scanner)
	if !found {
		return fmt.Errorf("missing phone")
	}
	args.Birthdate, found = r.nextLine(scanner)
	if !found {
		return fmt.Errorf("missing birthdate")
	}
	args.Cpf, found = r.nextLine(scanner)
	if !found {
		return fmt.Errorf("missing cpf")
	}

	args.Email = optionalValue(args.Email)
	args.Phone = extractOnlyDigits(args.Phone)
	args.Birthdate, found = parseDate(args.Birthdate)
	if !found {
		return fmt.Errorf("invalid birthdate format")
	}
	args.Cpf = extractOnlyDigits(args.Cpf)

	if err := args.Validate(); err != nil {
		return err.Error
	}

	if _, err := usecase.CreateCustomer(s, args); err != nil {
		return err.Error
	} else {
		log.Printf("Customer created with name: %s", args.Name)
		return nil
	}
}

func (r *RunInputCommand) runCreateSpecialist(s *State, scanner *bufio.Scanner) error {
	var args usecase.SpecialistInfoArgs
	var found bool
	args.Name, found = r.nextLine(scanner)
	if !found {
		return fmt.Errorf("missing name")
	}
	args.Email, found = r.nextLine(scanner)
	if !found {
		return fmt.Errorf("missing email")
	}
	args.Phone, found = r.nextLine(scanner)
	if !found {
		return fmt.Errorf("missing phone")
	}
	args.Birthdate, found = r.nextLine(scanner)
	if !found {
		return fmt.Errorf("missing birthdate")
	}
	args.Cpf, found = r.nextLine(scanner)
	if !found {
		return fmt.Errorf("missing cpf")
	}
	args.Cnpj, found = r.nextLine(scanner)
	if !found {
		return fmt.Errorf("missing cnpj")
	}

	args.Phone = extractOnlyDigits(args.Phone)
	args.Birthdate, found = parseDate(args.Birthdate)
	if !found {
		return fmt.Errorf("invalid birthdate format")
	}
	args.Cpf = extractOnlyDigits(args.Cpf)
	args.Cnpj = extractOnlyDigits(optionalValue(args.Cnpj))

	if err := args.Validate(); err != nil {
		return err.Error
	}

	if _, err := usecase.CreateSpecialist(s, args); err != nil {
		return err.Error
	} else {
		log.Printf("Specialist created with name: %s", args.Name)
		return nil
	}
}

func (r *RunInputCommand) runCreateSpecialization(s *State, scanner *bufio.Scanner) error {
	var args usecase.SpecializationInfoArgs
	var found bool
	args.Name, found = r.nextLine(scanner)
	if !found {
		return fmt.Errorf("missing name")
	}

	if err := args.Validate(); err != nil {
		return err.Error
	}

	if _, err := usecase.CreateSpecialization(s, args); err != nil {
		return err.Error
	} else {
		log.Printf("Specialization created with name: %s", args.Name)
		return nil
	}
}

func (r *RunInputCommand) runCreateService(s *State, scanner *bufio.Scanner) error {
	args := usecase.CreateServiceNameArgs{}
	var found bool
	specializationName, found := r.nextLine(scanner)
	if !found {
		return fmt.Errorf("missing specialization id")
	}
	args.Name, found = r.nextLine(scanner)
	if !found {
		return fmt.Errorf("missing name")
	}

	// TOOD: Show I create a usecase to get specialization by name?
	specialization, err := s.q.GetSpecializationByName(s.ctx, specializationName)
	if err != nil {
		return fmt.Errorf("error getting specialization: %w", err)
	}
	args.SpecializationID = specialization.ID

	if err := args.Validate(); err != nil {
		return err.Error
	}

	if _, err := usecase.CreateServiceName(s, args); err != nil {
		return err.Error
	} else {
		log.Printf("Service created with name: %s", args.Name)
		return nil
	}
}

func (r *RunInputCommand) runCreateSpecialistHours(s *State, scanner *bufio.Scanner) error {
	args := usecase.CreateSpecialistHoursArgs{}
	specialistEmail, found := r.nextLine(scanner)
	if !found {
		return fmt.Errorf("missing specialist email")
	}
	startWeekday, found := r.nextLine(scanner)
	if !found {
		return fmt.Errorf("missing start weekday")
	}
	endWeekday, found := r.nextLine(scanner)
	if !found {
		return fmt.Errorf("missing end weekday")
	}
	startTime, found := r.nextLine(scanner)
	if !found {
		return fmt.Errorf("missing start time")
	}
	endTime, found := r.nextLine(scanner)
	if !found {
		return fmt.Errorf("missing end time")
	}

	startWeekdayInt, ok := parseWeekday(startWeekday)
	if !ok {
		return fmt.Errorf("invalid start weekday")
	}
	endWeekdayInt, ok := parseWeekday(endWeekday)
	if !ok {
		return fmt.Errorf("invalid end weekday")
	}
	startTimeTime, ok := parseTime(startTime)
	if !ok {
		return fmt.Errorf("invalid start time")
	}
	endTimeTime, ok := parseTime(endTime)
	if !ok {
		return fmt.Errorf("invalid end time")
	}

	// TOOD: Show I create a usecase to get specialization by name?
	specialist, err := s.q.GetSpecialistByEmail(s.ctx, specialistEmail)
	if err != nil {
		return fmt.Errorf("error getting specialist: %w", err)
	}

	args.SpecialistID = specialist.ID
	args.StartTime = startTimeTime
	args.EndTime = endTimeTime

	createdCount := 0
	updatedCount := 0
	noopCount := 0
	errorCount := 0

	for weekday := startWeekdayInt; weekday <= endWeekdayInt; weekday++ {
		args.Weekday = weekday

		if err := args.Validate(); err != nil {
			return err.Error
		}

		op, _, _ := usecase.CreateSpecialistHours(s, args)
		switch op {
		case usecase.OperationCreate:
			createdCount++
		case usecase.OperationUpdate:
			updatedCount++
		case usecase.OperationNoop:
			noopCount++
		case usecase.OperationError:
			errorCount++
		}
	}

	log.Printf("Specialist hours created: %d, updated: %d, noop: %d, error: %d", createdCount, updatedCount, noopCount, errorCount)
	return nil
}

func (r *RunInputCommand) runCreateSpecialistService(s *State, scanner *bufio.Scanner) error {
	specialistEmail, found := r.nextLine(scanner)
	if !found {
		return fmt.Errorf("missing specialist email")
	}
	serviceName, found := r.nextLine(scanner)
	if !found {
		return fmt.Errorf("missing service name")
	}
	price, found := r.nextLine(scanner)
	if !found {
		return fmt.Errorf("missing price")
	}
	duration, found := r.nextLine(scanner)
	if !found {
		return fmt.Errorf("missing duration")
	}

	priceInt, ok := parsePrice(price)
	if !ok {
		return fmt.Errorf("invalid price")
	}

	durationMin, ok := parseDuration(duration)
	if !ok {
		return fmt.Errorf("invalid duration")
	}

	// TOOD: Show I create a usecase to get specialization by name?
	specialist, err := s.q.GetSpecialistByEmail(s.ctx, specialistEmail)
	if err != nil {
		return fmt.Errorf("error getting specialist: %w", err)
	}

	service, err := s.q.GetServiceNameByName(s.ctx, serviceName)
	if err != nil {
		return fmt.Errorf("error getting service: %w", err)
	}

	args := usecase.SpecialistServiceInfoArgs{
		SpecialistID:      specialist.ID,
		ServiceNameID:     service.ID,
		Price:             priceInt,
		DurationMin:       int32(durationMin),
		RequireSpecialist: true,
	}

	if err := args.Validate(); err != nil {
		return err.Error
	}

	if _, err := usecase.CreateSpecialistService(s, args); err != nil {
		return err.Error
	} else {
		log.Printf("Specialist service created with name: %s, duration: %s", serviceName, duration)
		return nil
	}
}

func (r *RunInputCommand) runCreateAppointment(s *State, scanner *bufio.Scanner) error {
	customerPhone, found := r.nextLine(scanner)
	if !found {
		return fmt.Errorf("missing customer phone")
	}
	specialistEmail, found := r.nextLine(scanner)
	if !found {
		return fmt.Errorf("missing specialist email")
	}
	serviceName, found := r.nextLine(scanner)
	if !found {
		return fmt.Errorf("missing service name")
	}
	date, found := r.nextLine(scanner)
	if !found {
		return fmt.Errorf("missing date")
	}
	time, found := r.nextLine(scanner)
	if !found {
		return fmt.Errorf("missing time")
	}

	time, ok := parseTime(time)
	if !ok {
		return fmt.Errorf("invalid time")
	}
	date, ok = parseDate(date)
	if !ok {
		return fmt.Errorf("invalid date")
	}

	// TOOD: Show I create a usecase to get specialization by name?
	customerPhone = extractOnlyDigits(customerPhone)
	customer, err := s.q.GetCustomerByPhone(s.ctx, customerPhone)
	if err != nil {
		return fmt.Errorf("error getting customer: %w", err)
	}

	specialist, err := s.q.GetSpecialistByEmail(s.ctx, specialistEmail)
	if err != nil {
		return fmt.Errorf("error getting specialist: %w", err)
	}

	service, err := s.q.GetServiceNameByName(s.ctx, serviceName)
	if err != nil {
		return fmt.Errorf("error getting service: %w", err)
	}

	args := usecase.CreateAppointmentArgs{
		CustomerID:    customer.ID,
		ServiceNameID: service.ID,
		SpecialistID:  specialist.ID,
		DateRaw:       date,
		TimeRaw:       time,
		Status:        int32(usecase.AppointmentStatusPending),
	}

	if err := args.Validate(); err != nil {
		return err.Error
	}

	if _, err := usecase.CreateAppointment(s, args); err != nil {
		return err.Error
	} else {
		log.Printf("Appointment created with date: %s, time: %s", date, time)
		return nil
	}
}

func (c *RunInputCommand) Execute(s *State) error {
	scanner := bufio.NewScanner(os.Stdin)

	prefix := "Command: "
	c.lineNumber = 0
	commandsCount := 6
	commandLine := 0
	for c.wait || scanner.Scan() {
		c.wait = false
		line := strings.TrimSpace(scanner.Text())

		c.lineNumber++
		if line == "" {
			continue
		}

		command, found := strings.CutPrefix(line, prefix)
		if !found {
			log.Println("Invalid command. Expected 'Command: <command>' on line", c.lineNumber)
			fmt.Println()
			continue
		}
		commandLine = c.lineNumber
		commandsCount++
		log.Printf("Line (%d) Command [%d]: %s", c.lineNumber, commandsCount, command)

		switch command {
		case "create admin":
			if err := c.runCreateAdmin(s, scanner); err != nil {
				log.Printf("Line (%d) %v", commandLine, err)
			}
		case "create secretary":
			if err := c.runCreateSecretary(s, scanner); err != nil {
				log.Printf("Line (%d) %v", commandLine, err)
			}
		case "create customer":
			if err := c.runCreateCustomer(s, scanner); err != nil {
				log.Printf("Line (%d) %v", commandLine, err)
			}
		case "create specialist":
			if err := c.runCreateSpecialist(s, scanner); err != nil {
				log.Printf("Line (%d) %v", commandLine, err)
			}
		case "create specialization":
			if err := c.runCreateSpecialization(s, scanner); err != nil {
				log.Printf("Line (%d) %v", commandLine, err)
			}
		case "create service":
			if err := c.runCreateService(s, scanner); err != nil {
				log.Printf("Line (%d) %v", commandLine, err)
			}
		case "create specialist hours":
			if err := c.runCreateSpecialistHours(s, scanner); err != nil {
				log.Printf("Line (%d) %v", commandLine, err)
			}
		case "create specialist service":
			if err := c.runCreateSpecialistService(s, scanner); err != nil {
				log.Printf("Line (%d) %v", commandLine, err)
			}
		case "create appointment":
			if err := c.runCreateAppointment(s, scanner); err != nil {
				log.Printf("Line (%d) %v", commandLine, err)
			}
		default:
			log.Printf("Line (%d) Invalid command: %s", commandLine, command)
		}

		fmt.Println()
	}

	if err := scanner.Err(); err != nil {
		return err
	}
	return nil
}
