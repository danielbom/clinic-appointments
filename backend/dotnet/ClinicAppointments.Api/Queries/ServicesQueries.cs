using ClinicAppointments.Db.Entities;

namespace ClinicAppointments.Api.Queries;

static class ServicesQueries
{
    public static IQueryable<ServiceEnriched> GetEnrichedServices(
        IQueryable<Service> services, IQueryable<Specialist> specialists,
        IQueryable<ServiceName> serviceNames, IQueryable<Specialization> specializations) =>
        from s in services
        join sp in specialists on s.SpecialistId equals sp.Id
        join sn in serviceNames on s.ServiceNameId equals sn.Id
        join sz in specializations on sn.SpecializationId equals sz.Id
        select new ServiceEnriched(s.Id, s.Price, s.Duration, sp.Id, sp.Name, sn.Id, sn.Name, sz.Id, sz.Name);
}

record ServiceEnriched(Guid Id, int Price, TimeSpan Duration,
    Guid SpecialistId, string SpecialistName,
    Guid ServiceNameId, string ServiceName,
    Guid SpecializationId, string SpecializationName);
