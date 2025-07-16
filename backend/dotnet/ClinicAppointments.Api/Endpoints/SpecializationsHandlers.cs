using ClinicAppointments.Api.Requests;
using ClinicAppointments.Db;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using ClinicAppointments.Api.Validations;
using ClinicAppointments.Db.Entities;

namespace ClinicAppointments.Api.Endpoints;

static class SpecializationsHandlers
{
    public static IResult GetSpecializations(AppDbContext ctx) =>
        Results.Ok(ctx.Specializations.OrderBy(it => it.Name));

    public static async Task<IResult> CreateSpecialization([FromBody] UpsertSpecializationBody body, AppDbContext ctx)
    {
        var (result, error) = UpsertSpecializationBodyValid.Create(body);
        if (result is null) return Results.BadRequest(error);

        var specializationExists = await ctx.Specializations.AsNoTracking()
            .Where(it => it.Name == result.Name)
            .FirstOrDefaultAsync();
        if (specializationExists is not null) return Results.BadRequest("specialization already exists");

        var specialization = new Specialization()
        {
            Id = Guid.NewGuid(),
            Name = result.Name,
        };
        ctx.Specializations.Add(specialization);
        await ctx.SaveChangesAsync();

        return Results.Json(specialization);
    }

    public static async Task<IResult> UpdateSpecialization(Guid specializationId, [FromBody] UpsertSpecializationBody body, AppDbContext ctx)
    {
        var (result, error) = UpsertSpecializationBodyValid.Create(body);
        if (result is null) return Results.BadRequest(error);

        var specializationExists = await ctx.Specializations.AsNoTracking()
            .Where(it => it.Name == result.Name)
            .Where(it => it.Id != specializationId)
            .FirstOrDefaultAsync();
        if (specializationExists is not null) return Results.BadRequest("specialization already exists");

        var specialization = await ctx.Specializations
            .Where(it => it.Id == specializationId)
            .FirstOrDefaultAsync();
        if (specialization is null) return Results.BadRequest("specialization not found");

        specialization.Name = result.Name;
        await ctx.SaveChangesAsync();

        return Results.Json(specialization);
    }

    public static async Task<IResult> DeleteSpecialization(Guid specializationId, AppDbContext ctx)
    {
        var specialization = await ctx.Specializations
            .Where(it => it.Id == specializationId)
            .FirstOrDefaultAsync();
        if (specialization is null) return Results.BadRequest("specialization not found");

        ctx.Specializations.Remove(specialization);
        await ctx.SaveChangesAsync();

        return Results.NoContent();
    }
}
