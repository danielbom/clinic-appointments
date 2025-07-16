using ClinicAppointments.Api.Requests;
using ClinicAppointments.Api.Queries;
using ClinicAppointments.Db;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using ClinicAppointments.Api.Validations;
using ClinicAppointments.Db.Entities;

namespace ClinicAppointments.Api.Endpoints;

static class ServicesHandlers
{
    public static async Task<IResult> GetServices([AsParameters] GetServicesParams query, AppDbContext ctx) => 
        Results.Ok(await ServicesQueries.GetEnrichedServices(
            ctx.Services.AsNoTracking(),
            ctx.Specialists.ByName(query.Specialist),
            ctx.ServiceNames.ByName(query.Service),
            ctx.Specializations.ByName(query.Specialization)
        ).Paginate(query).ToListAsync());

    public static async Task<IResult> CountServices([AsParameters] CountServicesParams query, AppDbContext ctx) => 
        Results.Ok(await ServicesQueries.GetEnrichedServices(
            ctx.Services.AsNoTracking(),
            ctx.Specialists.ByName(query.Specialist),
            ctx.ServiceNames.ByName(query.Service),
            ctx.Specializations.ByName(query.Specialization)
        ).CountAsync());
 
    public static async Task<IResult> GetService(Guid serviceId, AppDbContext ctx) =>
        (await ctx.Services.AsNoTracking()
            .Where(it => it.Id == serviceId)
            .ToListAsync())
            .Select(it => Results.Ok(it))
            .FirstOrDefault(Results.NotFound());

    public static async Task<IResult> CreateService([FromBody] UpsertServiceBody body, AppDbContext ctx)
    {
        var (result, error) = UpsertServiceBodyValid.Create(body);
        if (result is null) return Results.BadRequest(error);

        var serviceExists = await ctx.Services.AsNoTracking()
            .Where(it => it.ServiceNameId == result.ServiceNameId && it.SpecialistId == result.SpecialistId)
            .FirstOrDefaultAsync();
        if (serviceExists is not null) return Results.BadRequest("service already exists");

        var service = new Service()
        {
            Id = Guid.NewGuid(),
            Duration = result.Duration,
            Price = result.Price,
            ServiceNameId = result.ServiceNameId,
            SpecialistId = result.SpecialistId,
        };
        ctx.Services.Add(service);
        await ctx.SaveChangesAsync();

        return Results.Json(service);
    }

    public static async Task<IResult> UpdateService(Guid serviceId, [FromBody] UpsertServiceBody body, AppDbContext ctx)
    {
        var (result, error) = UpsertServiceBodyValid.Create(body, update: true);
        if (result is null) return Results.BadRequest(error);

        var service = await ctx.Services
            .Where(it => it.Id == serviceId)
            .FirstOrDefaultAsync();
        if (service is null) return Results.BadRequest("service not found");
        
        service.Price = result.Price;
        service.Duration = result.Duration;
        await ctx.SaveChangesAsync();

        return Results.Json(service);
    }

    public static async Task<IResult> DeleteService(Guid serviceId, AppDbContext ctx)
    {
        var service = await ctx.Services
            .Where(it => it.Id == serviceId)
            .FirstOrDefaultAsync();
        if (service is null) return Results.BadRequest("service not found");

        ctx.Services.Remove(service);
        await ctx.SaveChangesAsync();

        return Results.NoContent();
    }
}
