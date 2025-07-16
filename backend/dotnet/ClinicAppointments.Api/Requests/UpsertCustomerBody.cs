namespace ClinicAppointments.Api.Requests;

class UpsertCustomerBody
{
	public string? Name { get; set; }
	public string? Email { get; set; }
	public string? Phone { get; set; }
	public string? Birthdate { get; set; }
	public string? Cpf { get; set; }
}
