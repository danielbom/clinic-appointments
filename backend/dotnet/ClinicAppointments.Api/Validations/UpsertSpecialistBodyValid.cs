using ClinicAppointments.Api.Requests;

namespace ClinicAppointments.Api.Validations;

record UpsertSpecialistBodyValid(string Name, string Email, string Phone, DateOnly Birthdate, string Cpf, string Cnpj)
{
	public static (UpsertSpecialistBodyValid?, string?) Create(UpsertSpecialistBody body)
	{
		if (string.IsNullOrEmpty(body.Name)) return (null, "name is required");
		if (string.IsNullOrEmpty(body.Email)) return (null, "email is required");
		if (string.IsNullOrEmpty(body.Phone)) return (null, "phone is required");
		if (string.IsNullOrEmpty(body.Birthdate)) return (null, "birthdate is required");
		if (string.IsNullOrEmpty(body.Cpf)) return (null, "cpf is required");
		if (string.IsNullOrEmpty(body.Cnpj)) return (null, "cnpj is required");

		if (!DateOnly.TryParse(body.Birthdate, out DateOnly birthdate)) return (null, "birthdate is invalid");
		if (!ValidateEmail.IsEmailValid(body.Email)) return (null, "email is invalid");
		if (!ValidatePhone.IsPhoneValid(body.Phone)) return (null, "phone is invalid");
		if (!ValidateCpf.IsCpfValid(body.Cpf)) return (null, "cpf is invalid");
		if (!ValidateCnpj.IsCnpjValid(body.Cnpj)) return (null, "cnpj is invalid");

		return (new UpsertSpecialistBodyValid(body.Name, body.Email, body.Phone, birthdate, body.Cpf, body.Cnpj), null);
	}
}
