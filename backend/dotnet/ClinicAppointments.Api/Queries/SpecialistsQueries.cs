using ClinicAppointments.Db;
using ClinicAppointments.Db.Entities;
using ClinicAppointments.Db.Functions;

namespace ClinicAppointments.Api.Queries;

static class SpecialistsQueries
{
    public static IQueryable<Specialist> ByName(this IQueryable<Specialist> specialists, string? specialist) =>
        specialist is null ? specialists : specialists.Where(it => it.Name.Unaccent().Contains(specialist.Unaccent()));

    public static IQueryable<Specialization> GetSpecialistSpecializations_Linq(this AppDbContext ctx, Guid specialistId) =>
        (
            from sp in ctx.Specializations
            join sn in ctx.ServiceNames on sp.Id equals sn.SpecializationId
            join s in ctx.Services on sn.Id equals s.ServiceNameId
            where s.SpecialistId == specialistId
            select sp
        ).Distinct();

    public static IQueryable<Specialization> GetSpecialistSpecializations_Where(this AppDbContext ctx, Guid specialistId) =>
        ctx.Specializations
            .Where(sp => ctx.ServiceNames
                .Where(sn => ctx.Services
                    .Where(s => s.SpecialistId == specialistId)
                    .Select(s => s.ServiceNameId)
                    .Contains(sn.Id))
                .Select(sn => sn.SpecializationId)
                .Contains(sp.Id)
            );
}
