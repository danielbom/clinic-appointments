namespace ClinicAppointments.Api.Requests;

class CountAppointmentsParams
{
    public string? ServiceName { get; set; }
    public string? Specialist { get; set; }
    public string? Customer { get; set; }

    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
}