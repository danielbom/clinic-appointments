using ClinicAppointments.Api.Queries;
using ClinicAppointments.Api.Requests;
using ClinicAppointments.Db;
using ClinicAppointments.Db.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClinicAppointments.Api.Endpoints;

static class ServicesAvailableHandlers
{
    public static Task<IResult> GetServiceAvailables(AppDbContext ctx) => 
        ServiceGroupsHandlers.GetServiceGroups(ctx);
    
    public static async Task<IResult> GetServiceAvailable(Guid serviceId, AppDbContext ctx) => 
        (await (from sn in ctx.ServiceNames
        join sp in ctx.Specializations on sn.SpecializationId equals sp.Id
        where sn.Id == serviceId
        select new ServiceAvailable(sn.Id, sn.Name, sp.Id, sp.Name))
        .AsNoTracking()
        .ToListAsync())
        .Select(it => Results.Ok(it))
        .FirstOrDefault(Results.NotFound());

    public static async Task<IResult> CreateServiceAvailable([FromBody] CreateServiceAvailableBody body, AppDbContext ctx)
    {
        if (string.IsNullOrEmpty(body.Name)) return Results.BadRequest("name is required");
        
        var serviceNameByName = await ctx.ServiceNames.AsNoTracking()
            .ByName(body.Name)
            .FirstOrDefaultAsync();
        if (serviceNameByName is not null) return Results.BadRequest("serviceName.name already exists");

        Specialization? specialization = null;
        if (!string.IsNullOrEmpty(body.Specialization))
        {
            specialization = new Specialization()
            {
                Id = Guid.NewGuid(),
                Name = body.Specialization,
            };
            ctx.Specializations.Add(specialization);
            await ctx.SaveChangesAsync();
        }
        if (specialization is null && !string.IsNullOrEmpty(body.SpecializationId))
        {
            var specializationId = Guid.Parse(body.SpecializationId);
            specialization = await ctx.Specializations
                .AsNoTracking()
                .Where(it => it.Id == specializationId)
                .FirstOrDefaultAsync();
        }
        if (specialization is null) return Results.BadRequest("specialization or specializationId is required");

        var serviceName = new ServiceName()
        {
            Id = Guid.NewGuid(),
            Name = body.Name!,
            SpecializationId = specialization.Id,
        };
        ctx.ServiceNames.Add(serviceName);
        await ctx.SaveChangesAsync();

        return Results.Json(serviceName.Id);
    }

    public static async Task<IResult> UpdateServiceAvailable(Guid serviceId, [FromBody] UpdateServiceAvailableBody body, AppDbContext ctx)
    {
        if (string.IsNullOrEmpty(body.Name)) return Results.BadRequest("name is required");

        var nameAlreadyExists = await ctx.ServiceNames.AsNoTracking()
            .ByName(body.Name)
            .AnyAsync(it => it.Id != serviceId);
        if (nameAlreadyExists) return Results.BadRequest("serviceName.name already exists");

        var sn = await ctx.ServiceNames
            .Where(it => it.Id == serviceId)
            .FirstOrDefaultAsync();
        if (sn is null) return Results.BadRequest("serviceName not found");

        sn.Name = body.Name;
        await ctx.SaveChangesAsync();
        
        var sp = await ctx.Specializations
            .AsNoTracking()
            .ById(sn.SpecializationId)
            .FirstAsync();

        return Results.Json(new ServiceAvailable(sn.Id, sn.Name, sp.Id, sp.Name));
    }

    public static async Task<IResult> DeleteServiceAvailable(Guid serviceId, AppDbContext ctx) 
    {
        var serviceName = await ctx.ServiceNames
            .Where(it => it.Id == serviceId)
            .FirstOrDefaultAsync();
        if (serviceName is null) return Results.BadRequest("serviceName not found");

        ctx.ServiceNames.Remove(serviceName);
        await ctx.SaveChangesAsync();

        return Results.NoContent();
    }
}

record ServiceAvailable(Guid ServiceNameId, string ServiceName, Guid SpecializationId, string Specialization);
