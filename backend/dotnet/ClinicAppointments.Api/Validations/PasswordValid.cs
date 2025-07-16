namespace ClinicAppointments.Api.Validations;

record PasswordValid(string Value)
{
	public static (PasswordValid?, string?) Create(string? password, bool editing)
	{
		if (editing)
		{
			if (string.IsNullOrEmpty(password)) return (null, null);
		}
		else
		{
			if (string.IsNullOrEmpty(password)) return (null, "password is required");
		}
		if (!ValidatePassowrd.IsPasswordValid(password)) return (null, "password is invalid");
		return (new PasswordValid(password.EncryptPassword()), null);
	}
}
