namespace ClinicAppointments.Db.Entities;

public class Service
{
    public Guid Id { get; set; }
    public int Price { get; set; }
    public TimeSpan Duration { get; set; }

    public Guid ServiceNameId { get; set; }
    public Guid SpecialistId { get; set; }
}
