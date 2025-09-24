package cli

import (
	"flag"
	"fmt"
	"log"

	"backend/internal/usecase"
)

type CreateSpecialistCommand struct {
	Args usecase.SpecialistInfoArgs
	fs   *flag.FlagSet
}

func (c *CreateSpecialistCommand) Name() string {
	return "create-specialist"
}

func (c *CreateSpecialistCommand) Init() {
	c.fs = flag.NewFlagSet(c.Name(), flag.ExitOnError)
	c.fs.StringVar(&c.Args.Name.Value, "name", "", "Name")
	c.fs.StringVar(&c.Args.Email.Value, "email", "", "Email address")
	c.fs.StringVar(&c.Args.Phone.Value, "phone", "", "Phone number")
	c.fs.StringVar(&c.Args.BirthdateRaw, "birthdate", "", "Birthdate")
	c.fs.StringVar(&c.Args.Cpf.Value, "cpf", "", "CPF")
	c.fs.StringVar(&c.Args.Cnpj.Value, "cnpj", "", "CNPJ")
}

func (c *CreateSpecialistCommand) Parse(args []string) {
	c.fs.Parse(args)
}

func (c *CreateSpecialistCommand) Usage() {
	c.fs.Usage()
}

func (c *CreateSpecialistCommand) Help() {
	fmt.Println("create-specialist -name <name> -email <email> -phone <phone> -birthdate <birthdate> -cpf <cpf> -cnpj <cnpj>")
}

func (c *CreateSpecialistCommand) Execute(s *State) error {
	if err := c.Args.Validate(); err != nil {
		return err.Error
	}

	id, err := usecase.CreateSpecialist(s, c.Args)
	if err != nil {
		return err.Error
	}

	log.Printf("Speciailst created with name: %s\n%s", c.Args.Name, id)
	return nil
}
