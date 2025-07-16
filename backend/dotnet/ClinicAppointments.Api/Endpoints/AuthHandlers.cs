using ClinicAppointments.Api.Queries;
using ClinicAppointments.Api.Requests;
using ClinicAppointments.Api.Services;
using ClinicAppointments.Api.Validations;
using ClinicAppointments.Db;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClinicAppointments.Api.Endpoints;

static class AuthHandlers
{
    public static async Task<IResult> Login([FromBody] LoginBody body, AppDbContext ctx, TokenService tokenService)
    {
        if (body.Email is null) return Results.BadRequest("missing email");
        if (body.Password is null) return Results.BadRequest("missing password");

        var identity = await ctx.FindIdentity(email: body.Email) ?? throw new BadHttpRequestException("invalid credentials");

        if (!body.Password.ComparePassword(identity.Password)) throw new BadHttpRequestException("invalid credentials");

        var data = new JwtData(identity.Id.ToString(), identity.Role);

        var accessToken = tokenService.GenerateAccessToken(data);
        var refreshToken = tokenService.GenerateRefreshToken(data);

        return Results.Json(new AuthResponse(accessToken, refreshToken));
    }

    public static async Task<IResult> Refresh(AppDbContext ctx, HttpContext httpContext, TokenService tokenService)
    {
        if (!httpContext.Request.Headers.TryGetValue("Authorization", out var authHeader))
        {
            return Results.BadRequest("invalid token");
        }
        string refreshToken = authHeader.ToString().Replace("Bearer ", "", StringComparison.OrdinalIgnoreCase);

        var jwtData = tokenService.GetJwtData(httpContext);
        if (jwtData is null) return Results.Unauthorized();

        if (jwtData.Role != "") return Results.BadRequest("invalid token");
        if (!Guid.TryParse(jwtData.UserId, out Guid userId)) return Results.BadRequest("invalid token");

        var identity = await ctx.FindIdentity(id: userId) ?? throw new BadHttpRequestException("invalid token");

        var data = new JwtData(identity.Id.ToString(), identity.Role);
        var accessToken = tokenService.GenerateAccessToken(data);

        return Results.Json(new AuthResponse(accessToken, refreshToken));
    }

    public static async Task<IResult> Me(AppDbContext ctx, HttpContext httpContext, TokenService tokenService)
    {
        var jwtData = tokenService.GetJwtData(httpContext);
        if (jwtData is null) return Results.Unauthorized();

        if (jwtData.Role != "") return Results.BadRequest("invalid token");
        if (!Guid.TryParse(jwtData.UserId, out Guid userId)) return Results.BadRequest("invalid token");

        var identity = await ctx.FindIdentity(id: userId) ?? throw new BadHttpRequestException("invalid token");
        return Results.Json(identity);
    }
}

public record AuthResponse(string AccessToken, string RefreshToken);
