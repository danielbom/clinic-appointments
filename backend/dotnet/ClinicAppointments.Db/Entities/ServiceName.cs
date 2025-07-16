namespace ClinicAppointments.Db.Entities;

public class ServiceName
{
    public Guid Id { get; set; }
    public required string Name { get; set; }

    public Guid SpecializationId { get; set; }
}
