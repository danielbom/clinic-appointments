using ClinicAppointments.Db;

namespace ClinicAppointments.Api.Endpoints;

static class HealthHandlers
{
    public static IResult IsHealth(AppDbContext _ctx) => Results.Ok("Healthy!");
}
