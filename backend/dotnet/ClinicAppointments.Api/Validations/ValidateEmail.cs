namespace ClinicAppointments.Api.Validations;

static class ValidateEmail
{
    public static bool IsEmailValid(string email)
    {
        var parts = email.Split('@');
        if (parts.Length != 2) return false;
        if (string.IsNullOrWhiteSpace(parts[0])) return false;
        if (string.IsNullOrWhiteSpace(parts[1])) return false;
        return true;
    }
}
