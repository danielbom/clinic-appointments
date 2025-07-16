using BCrypt.Net;
using static ClinicAppointments.Api.Specifications.PasswordSpecifications;

namespace ClinicAppointments.Api.Validations;

static class ValidatePassowrd
{
	static readonly PasswordPolicy police = NoConstraint
		.And(AtLeast(8))
		.And(ContainsUpperLetter)
		.And(ContainsDigit)
		.And(ContainsAny("!@#$%^&*".ToCharArray()));

    public static bool IsPasswordValid(string password) => police.Invoke(password);

	public static string EncryptPassword(this string password)
	{
		return BCrypt.Net.BCrypt.HashPassword(password);
	}

	public static bool ComparePassword(this string password, string hashPassword)
	{
		return BCrypt.Net.BCrypt.Verify(password, hashPassword);
	}
}
