namespace ClinicAppointments.Api.Requests;

class UpsertServiceBody
{
	public string? SpecialistId { get; set; }
	public string? ServiceNameId { get; set; }
	public int? Price { get; set; }
	public int? Duration { get; set; }
}
