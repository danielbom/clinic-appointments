namespace ClinicAppointments.Db.Entities;

public class Secretary
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public required string Email { get; set; }
    public required string Password { get; set; }
    public required string Phone { get; set; }
    public DateOnly Birthdate { get; set; }
    public required string Cpf { get; set; }
    public required string Cnpj { get; set; }
}
