namespace ClinicAppointments.Db.Entities;

public class SpecialistHour
{
    public Guid Id { get; set; }
    public int Weekday { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }

    public Guid SpecialistId { get; set; }
}
