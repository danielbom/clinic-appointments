using ClinicAppointments.Db.Entities;
using ClinicAppointments.Db.Functions;

namespace ClinicAppointments.Api.Queries;

static class ServiceNamesQueries
{
    public static IQueryable<ServiceName> ByName(this IQueryable<ServiceName> serviceNames, string? serviceName) =>
        serviceName is null ? serviceNames : serviceNames.Where(it => it.Name.Unaccent().Contains(serviceName.Unaccent()));
}
