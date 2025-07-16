using ClinicAppointments.Api.Requests;
using ClinicAppointments.Api.Queries;
using ClinicAppointments.Db;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using ClinicAppointments.Api.Validations;
using ClinicAppointments.Db.Entities;

namespace ClinicAppointments.Api.Endpoints;

static class SpecialistsHandlers
{
    public static IResult GetSpecialists([AsParameters] GetSpecialistsParams query, AppDbContext ctx) =>
        Results.Ok(ctx.Specialists.AsNoTracking()
            .Paginate(query));

    public static IResult CountSpecialists([AsParameters] CountSpecialistsParams query, AppDbContext ctx) =>
        Results.Ok(ctx.Specialists.AsNoTracking()
            .Count());

    public static async Task<IResult> GetSpecialist(Guid specialistId, AppDbContext ctx) =>
        (await ctx.Specialists.AsNoTracking()
            .Where(it => it.Id == specialistId)
            .ToListAsync())
            .Select(it => Results.Ok(it))
            .FirstOrDefault(Results.NotFound());

    public static IResult GetSpecialistAppointments(Guid specialistId, AppDbContext ctx) =>
        Results.Ok(ctx.Appointments.AsNoTracking()
            .Where(it => it.SpecialistId == specialistId));

    public static IResult GetSpecialistSpecializations(Guid specialistId, AppDbContext ctx, string mode = "linq") =>
        Results.Ok(
            (mode == "where"
                ? ctx.GetSpecialistSpecializations_Where(specialistId)
                : ctx.GetSpecialistSpecializations_Linq(specialistId))
            .AsNoTracking());

    public static async Task<IResult> GetSpecialistServices(Guid specialistId, AppDbContext ctx) =>
        Results.Ok(await ServicesQueries.GetEnrichedServices(
            ctx.Services.AsNoTracking(),
            ctx.Specialists.Where(it => it.Id == specialistId),
            ctx.ServiceNames,
            ctx.Specializations
        ).ToListAsync());

    public static async Task<IResult> CreateSpecialist([FromBody] UpsertSpecialistBody body, AppDbContext ctx)
    {
        using var transaction = await ctx.Database.BeginTransactionAsync();
        Specialist? specialist;
        try
        {
            // Create the specialist entity
            {
                var (result, error) = UpsertSpecialistBodyValid.Create(body);
                if (result is null) return Results.BadRequest(error);
                specialist = new Specialist()
                {
                    Id = Guid.NewGuid(),
                    Name = result.Name,
                    Email = result.Email,
                    Phone = result.Phone,
                    Birthdate = result.Birthdate,
                    Cpf = result.Cpf,
                    Cnpj = result.Cnpj,
                };
                ctx.Specialists.Add(specialist);
                await ctx.SaveChangesAsync();
            }

            // Create the specialist service entities
            if (body.Services is not null)
            {
                // validate each service received in the request body
                var specialistIdStr = specialist.Id.ToString();
                var (bodyServices, error) = UpsertServiceBodyValid.CreateMany(
                    body.Services?.Select(s => new UpsertServiceBody() 
                    {
                        Duration = s.Duration,
                        Price = s.Price,
                        ServiceNameId = s.ServiceNameId,
                        SpecialistId = specialistIdStr
                    }));
                if (bodyServices is null)
                {
                    transaction.Rollback();
                    return Results.BadRequest(error);
                }

                // insert all services
                foreach (var result in bodyServices)
                {
                    var service = new Service()
                    {
                        Id = Guid.NewGuid(),
                        Duration = result.Duration,
                        Price = result.Price,
                        ServiceNameId = result.ServiceNameId,
                        SpecialistId = result.SpecialistId,
                    };
                    ctx.Services.Add(service);
                }
                await ctx.SaveChangesAsync();
            }
            await transaction.CommitAsync();
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }

        return Results.Ok(specialist);
    }

    public static async Task<IResult> UpdateSpecialist(Guid specialistId, [FromBody] UpsertSpecialistBody body, AppDbContext ctx)
    {
        using var transaction = await ctx.Database.BeginTransactionAsync();
        Specialist? specialist;
        try
        {
            // Update the specialist entity
            {
                var (result, error) = UpsertSpecialistBodyValid.Create(body);
                if (result is null) return Results.BadRequest(error);

                specialist = await ctx.Specialists
                    .Where(it => it.Id == specialistId)
                    .FirstOrDefaultAsync();
                if (specialist is null) return Results.BadRequest("specialist not found");

                ctx.Entry(specialist).CurrentValues.SetValues(result);
                await ctx.SaveChangesAsync();
            }

            // Insert, update or delete the specialist service entities
            if (body.Services is not null)
            {
                var specialistIdStr = specialist.Id.ToString();
                var (bodyServices, error) = UpsertServiceBodyValid.CreateMany(
                    body.Services?.Select(s => new UpsertServiceBody() 
                    {
                        Duration = s.Duration,
                        Price = s.Price,
                        ServiceNameId = s.ServiceNameId,
                        SpecialistId = specialistIdStr
                    }));
                if (bodyServices is null)
                {
                    transaction.Rollback();
                    return Results.BadRequest(error);
                }

                var oldServices = await ctx.Services
                    .Where(it => it.SpecialistId == specialistId)
                    .ToListAsync();

                foreach (var data in bodyServices)
                {
                    var service = oldServices
                        .Where(it => it.ServiceNameId == data.ServiceNameId)
                        .FirstOrDefault();

                    if (service is null)
                    {
                        // create
                        service = new Service()
                        {
                            Id = Guid.NewGuid(),
                            Duration = data.Duration,
                            Price = data.Price,
                            ServiceNameId = data.ServiceNameId,
                            SpecialistId = data.SpecialistId,
                        };
                        ctx.Services.Add(service);
                    }
                    else
                    {
                        // update
                        service.Price = data.Price;
                        service.Duration = data.Duration;
                    }
                    await ctx.SaveChangesAsync();
                }

                var newServices = bodyServices.Select(it => it.ServiceNameId).ToHashSet();
                foreach (var service in oldServices)
                {
                    if (!newServices.Contains(service.ServiceNameId))
                    {
                        // delete
                        ctx.Services.Remove(service);
                        await ctx.SaveChangesAsync();
                    }
                }
            }
            await transaction.CommitAsync();
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }

        return Results.Ok(specialist);
    }

    public static async Task<IResult> DeleteSpecialist(Guid specialistId, AppDbContext ctx)
    {
        var specialist = await ctx.Specialists
            .Where(it => it.Id == specialistId)
            .FirstOrDefaultAsync();
        if (specialist is null) return Results.BadRequest("specialist not found");

        ctx.Specialists.Remove(specialist);
        await ctx.SaveChangesAsync();

        return Results.NoContent();
    }
}
