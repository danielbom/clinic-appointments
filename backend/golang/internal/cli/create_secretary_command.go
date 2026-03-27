package cli

import (
	"flag"
	"fmt"
	"log"

	"backend/internal/usecase"
)

type CreateSecretaryCommand struct {
	Args usecase.SecretaryInfoArgs
	fs   *flag.FlagSet
}

func (c *CreateSecretaryCommand) Name() string {
	return "create-secretary"
}

func (c *CreateSecretaryCommand) Init() {
	c.fs = flag.NewFlagSet(c.Name(), flag.ExitOnError)
	c.fs.StringVar(&c.Args.Name.Value, "name", "", "Name")
	c.fs.StringVar(&c.Args.Email.Value, "email", "", "Email address")
	c.fs.StringVar(&c.Args.Password.Value, "password", "", "Password")
	c.fs.StringVar(&c.Args.Phone.Value, "phone", "", "Phone number")
	c.fs.StringVar(&c.Args.BirthdateRaw, "birthdate", "", "Birthdate")
	c.fs.StringVar(&c.Args.Cpf.Value, "cpf", "", "CPF")
	c.fs.StringVar(&c.Args.Cnpj.Value, "cnpj", "", "CNPJ")
}

func (c *CreateSecretaryCommand) Parse(args []string) {
	c.fs.Parse(args)
}

func (c *CreateSecretaryCommand) Usage() {
	c.fs.Usage()
}

func (c *CreateSecretaryCommand) Help() {
	fmt.Println("create-secretary -name <name> -email <email> -password <password> -phone <phone> -birthdate <birthdate> -cpf <cpf> -cnpj <cnpj>")
}

func (c *CreateSecretaryCommand) Execute(s *State) error {
	if err := c.Args.Validate(); err != nil {
		return err.Error
	}

	secretary, err := usecase.CreateSecretary(s, c.Args)
	if err != nil {
		return fmt.Errorf("error creating secretary: %w", err.Error)
	}

	log.Printf("Secretary created with email: %s\n%s", c.Args.Email, secretary.ID)
	return nil
}
