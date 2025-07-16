namespace ClinicAppointments.Api.Requests;

class CreateAppointmentBody
{
	public Guid CustomerId { get; set; } 
	public Guid ServiceId { get; set; }  
	public DateOnly Date { get; set; }       
	public TimeOnly Time { get; set; }       
}
