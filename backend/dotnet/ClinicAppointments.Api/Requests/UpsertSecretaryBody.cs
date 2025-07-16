namespace ClinicAppointments.Api.Requests;

class UpsertSecretaryBody
{
	public string? Name { get; set; }
	public string? Email { get; set; }
	public string? Phone { get; set; }
	public string? Birthdate { get; set; }
	public string? Password { get; set; }
	public string? Cpf { get; set; }
	public string? Cnpj { get; set; }
}
