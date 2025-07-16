using ClinicAppointments.Api.Requests;
using ClinicAppointments.Api.Queries;
using ClinicAppointments.Db;
using Microsoft.EntityFrameworkCore;
using ClinicAppointments.Api.Validations;
using Microsoft.AspNetCore.Mvc;
using ClinicAppointments.Db.Entities;
using ClinicAppointments.Api.Responses;

namespace ClinicAppointments.Api.Endpoints;

static class SecretariesHandlers
{
    public static IResult GetSecretaries([AsParameters] GetSecretariesParams query, AppDbContext ctx) =>
        Results.Ok(ctx.Secretaries.AsNoTracking()
            .ByName(query.Name)
            .ByCpf(query.Cpf)
            .ByCnpj(query.Cnpj)
            .ByPhone(query.Phone)
            .Paginate(query)
            .Select(s => SecretaryResponse.FromEntity(s)));
 
    public static IResult CountSecretaries([AsParameters] CountSecretariesParams query, AppDbContext ctx) =>
        Results.Ok(ctx.Secretaries.AsNoTracking()
            .ByName(query.Name)
            .ByCpf(query.Cpf)
            .ByCnpj(query.Cnpj)
            .ByPhone(query.Phone)
            .Count());
 
    public static async Task<IResult> GetSecretary(Guid secretaryId, AppDbContext ctx) =>
        (await ctx.Secretaries.AsNoTracking()
            .Where(it => it.Id == secretaryId)
            .ToListAsync())
            .Select(it => Results.Ok(SecretaryResponse.FromEntity(it)))
            .FirstOrDefault(Results.NotFound());

    public static async Task<IResult> CreateSecretary([FromBody] UpsertSecretaryBody body, AppDbContext ctx)
    {
        var (result, error) = UpsertSecretaryBodyValid.Create(body);
        if (result is null) return Results.BadRequest(error);

        var secretaryWithEmail = await ctx.Secretaries
            .ByEmail(result.Email)
            .FirstOrDefaultAsync();
        if (secretaryWithEmail is not null) return Results.BadRequest("secretary.email already exists");

        var secretary = new Secretary()
        {
            Id = Guid.NewGuid(),
            Name= result.Name,
            Cnpj = result.Cnpj,
            Cpf = result.Cpf,
            Email = result.Email,
            Password = result.Password!,
            Phone = result.Phone,
            Birthdate = result.Birthdate,
        };
        ctx.Secretaries.Add(secretary);
        await ctx.SaveChangesAsync();

        return Results.Json(SecretaryResponse.FromEntity(secretary));
    }

    public static async Task<IResult> UpdateSecretary(Guid secretaryId, [FromBody] UpsertSecretaryBody body, AppDbContext ctx)
    {
        var (result, error) = UpsertSecretaryBodyValid.Create(body, editing: true);
        if (result is null) return Results.BadRequest(error);

        var secretaryWithEmail = await ctx.Secretaries
            .ByEmail(result.Email)
            .Where(it => it.Id != secretaryId)
            .FirstOrDefaultAsync();
        if (secretaryWithEmail is not null) return Results.BadRequest("secretary.email already exists");

        var secretary = await ctx.Secretaries
            .Where(it => it.Id == secretaryId)
            .FirstOrDefaultAsync();
        if (secretary is null) return Results.BadRequest("secretary not found");

        ctx.Entry(secretary).CurrentValues.SetValues(result with 
        {
            Password = result.Password ?? secretary.Password // keep the last password if none was provided
        });
        await ctx.SaveChangesAsync();

        return Results.Json(SecretaryResponse.FromEntity(secretary));
    }

    public static async Task<IResult> DeleteSecretary(Guid secretaryId, AppDbContext ctx)
    {
        var secretary = await ctx.Secretaries
            .Where(it => it.Id == secretaryId)
            .FirstOrDefaultAsync();
        if (secretary is null) return Results.BadRequest("secretary not found");

        ctx.Secretaries.Remove(secretary);
        await ctx.SaveChangesAsync();

        return Results.NoContent();
    }
}
