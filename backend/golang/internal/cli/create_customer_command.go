package cli

import (
	"flag"
	"fmt"
	"log"

	"backend/internal/usecase"
)

type CreateCustomerCommand struct {
	Args usecase.CustomerInfoArgs
	fs   *flag.FlagSet
}

func (c *CreateCustomerCommand) Name() string {
	return "create-customer"
}

func (c *CreateCustomerCommand) Init() {
	c.fs = flag.NewFlagSet(c.Name(), flag.ExitOnError)
	c.fs.StringVar(&c.Args.Name.Value, "name", "", "Name")
	c.fs.StringVar(&c.Args.Email.Value, "email", "", "Email address")
	c.fs.StringVar(&c.Args.Phone.Value, "phone", "", "Phone number")
	c.fs.StringVar(&c.Args.BirthdateRaw, "birthdate", "", "Birthdate")
	c.fs.StringVar(&c.Args.Cpf.Value, "cpf", "", "CPF")
}

func (c *CreateCustomerCommand) Parse(args []string) {
	c.fs.Parse(args)
}

func (c *CreateCustomerCommand) Usage() {
	c.fs.Usage()
}

func (c *CreateCustomerCommand) Help() {
	fmt.Println("create-customer -name <name> -email <email> -phone <phone> -birthdate <birthdate> -cpf <cpf>")
}

func (c *CreateCustomerCommand) Execute(s *State) error {
	if err := c.Args.Validate(); err != nil {
		return err.Error
	}

	customer, err := usecase.CreateCustomer(s, c.Args)
	if err != nil {
		return fmt.Errorf("error creating customer: %w", err.Error)
	}

	log.Printf("Customer created with email: %s\n%s", c.Args.Email.Value, customer.ID)
	return nil
}
