using ClinicAppointments.Api.Requests;

namespace ClinicAppointments.Api.Validations;

record UpsertSecretaryBodyValid(string Name, string Email, string Phone, DateOnly Birthdate, string? Password, string Cpf, string Cnpj)
{
	public static (UpsertSecretaryBodyValid?, string?) Create(UpsertSecretaryBody body, bool editing = false)
	{
		if (string.IsNullOrEmpty(body.Name)) return (null, "name is required");
		if (string.IsNullOrEmpty(body.Email)) return (null, "email is required");
		if (string.IsNullOrEmpty(body.Phone)) return (null, "phone is required");
		if (string.IsNullOrEmpty(body.Birthdate)) return (null, "birthdate is required");
		if (string.IsNullOrEmpty(body.Cpf)) return (null, "cpf is required");
		if (string.IsNullOrEmpty(body.Cnpj)) return (null, "cnpj is required");

		var (password, error) = PasswordValid.Create(body.Password, editing);
		if (error is not null) return (null, error);

		if (!DateOnly.TryParse(body.Birthdate, out DateOnly birthdate)) return (null, "birthdate is invalid");
		if (!ValidateEmail.IsEmailValid(body.Email)) return (null, "email is invalid");
		if (!ValidatePhone.IsPhoneValid(body.Phone)) return (null, "phone is invalid");
		if (!ValidateCpf.IsCpfValid(body.Cpf)) return (null, "cpf is invalid");
		if (!ValidateCnpj.IsCnpjValid(body.Cnpj)) return (null, "cnpj is invalid");

		return (new UpsertSecretaryBodyValid(body.Name, body.Email, body.Phone, birthdate, password?.Value, body.Cpf, body.Cnpj), null);
	}
}
