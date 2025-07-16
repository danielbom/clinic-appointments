using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

namespace ClinicAppointments.Api.Configuration;

static class AuthConfiguration
{
    public static void ConfigureAuthentication(this IServiceCollection services, ConfigurationManager configuration)
    {
        var jwtSettings = configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"] ?? SettingsIncomplete("SecretKey");
        var issuer = jwtSettings["Issuer"] ?? SettingsIncomplete("Issuer");
        var audience = jwtSettings["Audience"] ?? SettingsIncomplete("Audience");

        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = issuer,
                    ValidAudience = audience,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
                };
            });
    }

    private static string SettingsIncomplete(string field) => throw new Exception($"JwtSettings.{field} is required in appsettings.json");
}
