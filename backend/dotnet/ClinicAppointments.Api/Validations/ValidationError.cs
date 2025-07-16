namespace ClinicAppointments.Api.Validations;

public class PropertiesErrors
{
    public Dictionary<string, string> Errors { get; set; } = [];

    public bool HasError() => Errors.Count == 0;

    public void AddError(string field, string message)
    {
        field = ToCamelCase(field);
        Errors[field] = message;
    }

    public PropertiesErrors IsNullOrEmpty(string field)
    {
        AddError(field, "is null or empty");
        return this;
    }

    public PropertiesErrors IsInvalid(string field)
    {
        AddError(field, "is invalid");
        return this;
    }

    public PropertiesErrors AlreadyExists(string field)
    {
        AddError(field, "already exists");
        return this;
    }

    private static string ToCamelCase(string str)
    {
        if (string.IsNullOrEmpty(str)) return str;
        return char.ToLowerInvariant(str[0]) + str[1..];
    }
}
