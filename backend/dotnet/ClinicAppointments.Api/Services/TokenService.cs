using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace ClinicAppointments.Api.Services;

public class TokenService(IConfiguration configuration)
{
    private readonly string _secretKey = configuration["JwtSettings:SecretKey"]!;
    private readonly string _issuer = configuration["JwtSettings:Issuer"]!;
    private readonly string _audience = configuration["JwtSettings:Audience"]!;

    private string TokenGenerator(string userId, string role, int expiresIn)
    {
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secretKey));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, userId),
            new Claim(ClaimTypes.Role, role),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _issuer,
            audience: _audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(expiresIn),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateAccessToken(JwtData data) => TokenGenerator(data.UserId, data.Role, 1);

    public string GenerateRefreshToken(JwtData data) => TokenGenerator(data.UserId, "", 24);

    public JwtData? GetJwtData(HttpContext httpContext)
    {
        var userId = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var role = httpContext.User.FindFirst(ClaimTypes.Role)?.Value;
        if (string.IsNullOrEmpty(userId) || role is null)
            return null;
        return new(userId, role);
    }
}

public record JwtData(string UserId, string Role);