using ClinicAppointments.Api.Validations;
using ClinicAppointments.Db;
using ClinicAppointments.Db.Entities;
using Microsoft.EntityFrameworkCore;

namespace ClinicAppointments.Api.Endpoints;

static class TestHandlers
{
    public static IResult GetStats(IConfiguration configuration) => Results.Json(new TestStats(
        "Environment: TEST",
        configuration["ConnectionStrings:DefaultConnection"] ?? "<empty>"
    ));

    public static async Task<IResult> Init(AppDbContext ctx)
    {
        await ctx.Database.ExecuteSqlRawAsync("DELETE FROM admins;");
        await ctx.Database.ExecuteSqlRawAsync("DELETE FROM appointments;");
        await ctx.Database.ExecuteSqlRawAsync("DELETE FROM customers;");
        await ctx.Database.ExecuteSqlRawAsync("DELETE FROM secretaries;");
        await ctx.Database.ExecuteSqlRawAsync("DELETE FROM services;");
        await ctx.Database.ExecuteSqlRawAsync("DELETE FROM service_names;");
        await ctx.Database.ExecuteSqlRawAsync("DELETE FROM specialists;");
        await ctx.Database.ExecuteSqlRawAsync("DELETE FROM specialist_hours;");
        await ctx.Database.ExecuteSqlRawAsync("DELETE FROM specializations;");

        var admin = new Admin()
        {
            Id = Guid.NewGuid(),
            Name = "Admin Test",
            Email = "admin@test.com",
            Password = "123mudar".EncryptPassword(),
        };
        await ctx.Admins.AddAsync(admin);
        await ctx.SaveChangesAsync();

        return Results.Ok("System initialized to be tested");
    }

    public static IResult DebugClaims(HttpContext httpContext)
    {
        var claims = httpContext.User.Claims.Select(c => new { c.Type, c.Value }).ToList();
        return Results.Ok(claims);
    }
}

public record TestStats(string Message, string Database);
