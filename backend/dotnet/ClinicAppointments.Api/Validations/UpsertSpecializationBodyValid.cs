using ClinicAppointments.Api.Requests;

namespace ClinicAppointments.Api.Validations;

record UpsertSpecializationBodyValid(string Name)
{
	public static (UpsertSpecializationBodyValid?, string?) Create(UpsertSpecializationBody body)
	{
		if (string.IsNullOrEmpty(body.Name)) return (null, "name is required");

        return (new UpsertSpecializationBodyValid(body.Name), null);
	}
}
