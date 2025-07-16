namespace ClinicAppointments.Api.Requests;

class UpdateAppointmentBody
{
	public DateOnly Date { get; set; }
	public TimeOnly Time { get; set; }
	public int Status { get; set; }
}
