namespace ClinicAppointments.Api.Validations;

static class ValidatePhone
{
    public static bool IsPhoneValid(string phone)
    {
        return phone.All(char.IsDigit);
    }
}
