
namespace ClinicAppointments.Api.Requests;

class GetAppointmentsCalendarParams
{
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
}
