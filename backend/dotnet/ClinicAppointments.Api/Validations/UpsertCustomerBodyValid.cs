using ClinicAppointments.Api.Requests;

namespace ClinicAppointments.Api.Validations;

record UpsertCustomerBodyValid(string Name, string Email, string Phone, DateOnly Birthdate, string Cpf)
{
	public static (UpsertCustomerBodyValid?, string?) Create(UpsertCustomerBody body)
	{
		if (string.IsNullOrWhiteSpace(body.Name)) return (null, "name is required");
		if (string.IsNullOrWhiteSpace(body.Email)) return (null, "email is required");
		if (string.IsNullOrWhiteSpace(body.Phone)) return (null, "phone is required");
		if (string.IsNullOrWhiteSpace(body.Birthdate)) return (null, "birthdate is required");
		if (string.IsNullOrWhiteSpace(body.Cpf)) return (null, "cpf is required");

        if (!DateOnly.TryParse(body.Birthdate, out DateOnly birthdate)) return (null, "birthdate is invalid");
		if (!ValidateEmail.IsEmailValid(body.Email)) return (null, "email is invalid");
		if (!ValidatePhone.IsPhoneValid(body.Phone)) return (null, "phone is invalid");
		if (!ValidateCpf.IsCpfValid(body.Cpf)) return (null, "cpf is invalid");

        return (new UpsertCustomerBodyValid(body.Name, body.Email, body.Phone, birthdate, body.Cpf), null);
	}

	public static (UpsertCustomerBodyValid?, PropertiesErrors) Create2(UpsertCustomerBody body)
	{
		var errors = new PropertiesErrors();
		DateOnly birthdate = default;
		if (string.IsNullOrWhiteSpace(body.Name)) errors.IsNullOrEmpty(nameof(body.Name));

		if (string.IsNullOrWhiteSpace(body.Email)) errors.IsNullOrEmpty(nameof(body.Email));
		else if (!ValidateEmail.IsEmailValid(body.Email)) errors.IsInvalid(nameof(body.Email));

		if (string.IsNullOrWhiteSpace(body.Phone)) errors.IsNullOrEmpty(nameof(body.Phone));
		else if (!ValidatePhone.IsPhoneValid(body.Phone)) errors.IsInvalid(nameof(body.Phone));
		
		if (string.IsNullOrWhiteSpace(body.Birthdate)) errors.IsNullOrEmpty(nameof(body.Birthdate));
        else if (!DateOnly.TryParse(body.Birthdate, out birthdate)) errors.IsInvalid(nameof(body.Birthdate));

		if (string.IsNullOrWhiteSpace(body.Cpf)) errors.IsNullOrEmpty(nameof(body.Cpf));
		else if (!ValidateCpf.IsCpfValid(body.Cpf)) errors.IsInvalid(nameof(body.Cpf));

		if (!errors.HasError()) return (null, errors);

		return (new UpsertCustomerBodyValid(body.Name!, body.Email!, body.Phone!, birthdate, body.Cpf!), errors);
	}
}
