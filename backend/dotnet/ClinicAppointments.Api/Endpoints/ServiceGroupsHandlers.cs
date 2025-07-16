using ClinicAppointments.Db;
using ClinicAppointments.Db.Entities;
using Microsoft.EntityFrameworkCore;

namespace ClinicAppointments.Api.Endpoints;

static class ServiceGroupsHandlers
{
    public static async Task<IResult> GetServiceGroups(AppDbContext ctx)
    {
        var specializations = await ctx.Specializations.AsNoTracking().ToListAsync();
        var serviceNames = (await ctx.ServiceNames.AsNoTracking().ToListAsync())
            .GroupBy(sn => sn.SpecializationId)
            .ToDictionary(g => g.Key, g => g.ToList());
        return Results.Ok(specializations
            .Select(s => new
            {
                s.Id,
                s.Name,
                Items = serviceNames.TryGetValue(s.Id, out List<ServiceName>? value) ? value : []
            }));
    }
}
