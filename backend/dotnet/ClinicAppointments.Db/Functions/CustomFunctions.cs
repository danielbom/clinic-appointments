using Microsoft.EntityFrameworkCore;

namespace ClinicAppointments.Db.Functions;

public static class CustomFunctions
{
    [DbFunction("unaccent", "public")]
    public static string Unaccent(this string? text)
    {
        throw new NotSupportedException("This method is only intended for use in LINQ to Entities queries.");
    }
}
