using ClinicAppointments.Db.Entities;
using ClinicAppointments.Db.Functions;

namespace ClinicAppointments.Api.Queries;

static class SpecializationsQueries
{
    public static IQueryable<Specialization> ById(this IQueryable<Specialization> specializations, Guid specializationId) =>
        specializations.Where(it => it.Id.Equals(specializationId));

    public static IQueryable<Specialization> ByName(this IQueryable<Specialization> specializations, string? specialization) =>
        specialization is null ? specializations : specializations.Where(it => it.Name.Unaccent().Contains(specialization.Unaccent()));
}
