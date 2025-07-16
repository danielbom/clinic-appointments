using ClinicAppointments.Db;
using ClinicAppointments.Db.Entities;
using Microsoft.EntityFrameworkCore;

namespace ClinicAppointments.Api.Queries;

static class IdentityQueries
{
    public static async Task<Identity?> FindIdentity(this AppDbContext ctx, string? email = null, Guid? id = null)
    {
        var admins = ctx.Admins.AsNoTracking()
            .ByEmail(email)
            .ById(id)
            .Select(it => new Identity(it.Id, it.Name, it.Email, it.Password, "admin"));
        if (await admins.FirstOrDefaultAsync() is Identity result) return result;
        var secretaries = ctx.Secretaries
            .AsNoTracking()
            .ByEmail(email)
            .ById(id)
            .Select(it => new Identity(it.Id, it.Name, it.Email, it.Password, "secretary"));
        return await secretaries.FirstOrDefaultAsync();
    }

    public static IQueryable<Admin> ByEmail(this IQueryable<Admin> admins, string? email) =>
        email is null ? admins : admins.Where(it => it.Email == email);

    public static IQueryable<Admin> ById(this IQueryable<Admin> admins, Guid? id) =>
        id is null ? admins : admins.Where(it => it.Id == id);
}

public record Identity(Guid Id, string Name, string Email, string Password, string Role);
