using ClinicAppointments.Db.Entities;
using ClinicAppointments.Db.Functions;

namespace ClinicAppointments.Api.Queries;

static class AppointmentsQueries
{
    public static IQueryable<Appointment> AfterDate(this IQueryable<Appointment> appointments, DateOnly? startDate) =>
        startDate is null ? appointments : appointments.Where(it => it.Date >= startDate);

    public static IQueryable<Appointment> BeforeDate(this IQueryable<Appointment> appointments, DateOnly? endDate) =>
        endDate is null ? appointments : appointments.Where(it => it.Date <= endDate);

    public static IQueryable<Appointment> ByCustomer(this IQueryable<Appointment> appointments, IQueryable<Customer> customers, string? customer) =>
        string.IsNullOrEmpty(customer) ? appointments : 
            appointments.Where(it => customers.Where(it => it.Name.Unaccent().Contains(customer.Unaccent())).Select(it => it.Id).Contains(it.CustomerId));

    public static IQueryable<Appointment> ByService(this IQueryable<Appointment> appointments, IQueryable<ServiceName> serviceNames, string? serviceName) =>
        string.IsNullOrEmpty(serviceName) ? appointments : 
            appointments.Where(it => serviceNames.Where(it => it.Name.Unaccent().Contains(serviceName.Unaccent())).Select(it => it.Id).Contains(it.ServiceNameId));

    public static IQueryable<Appointment> BySpecialist(this IQueryable<Appointment> appointments, IQueryable<Specialist> specialists, string? specialist) =>
        string.IsNullOrEmpty(specialist) ? appointments : 
            appointments.Where(it => specialists.Where(it => it.Name.Unaccent().Contains(specialist.Unaccent())).Select(it => it.Id).Contains(it.SpecialistId));

    public static IQueryable<AppointmentCalendar> CalendarSelection(this IQueryable<Appointment> appointments, IQueryable<Specialist> specialists) => 
        from a in appointments
            join s in specialists on a.SpecialistId equals s.Id
            select new AppointmentCalendar(a.Id, a.Date, a.Time, a.Status, s.Name);

    public static IQueryable<Appointment> Intersections(this IQueryable<Appointment> appointments, DateOnly date, TimeOnly time, Guid specialistId, TimeSpan duration) =>
        appointments
            .Where(it => it.Date == date)
            .Where(it => it.SpecialistId == specialistId)
            .Where(it => (it.Time <= time && time < it.Time.Add(it.Duration))
                || (it.Time < time.Add(duration) && time.Add(duration) < it.Time.Add(it.Duration)));
}

record AppointmentCalendar(Guid Id, DateOnly Date, TimeOnly Time, int Status, string SpecialistName);
