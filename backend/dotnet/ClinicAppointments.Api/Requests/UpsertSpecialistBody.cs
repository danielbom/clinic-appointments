namespace ClinicAppointments.Api.Requests;

class UpsertSpecialistBody
{
    public string? Name { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Birthdate { get; set; }
    public string? Cpf { get; set; }
    public string? Cnpj { get; set; }
    public IList<SpecialistServiceInfoBody>? Services { get; set; }
}

class SpecialistServiceInfoBody
{
    public string? ServiceNameId { get; set; }
    public int? Price { get; set; }
    public int? Duration { get; set; }
}
