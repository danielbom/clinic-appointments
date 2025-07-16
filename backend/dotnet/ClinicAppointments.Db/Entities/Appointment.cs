using Microsoft.EntityFrameworkCore;

namespace ClinicAppointments.Db.Entities;

public class Appointment
{
    public Guid Id { get; set; }
    public int Price { get; set; }
    public TimeSpan Duration { get; set; }
    public DateOnly Date { get; set; }
    public TimeOnly Time { get; set; }
    public int Status { get; set; }
    public DateTimeOffset? NotifiedAt { get; set; }

    public Guid? NotifiedById { get; set; }
    public Guid CustomerId { get; set; }
    public Guid SpecialistId { get; set; }
    public Guid ServiceNameId { get; set; }

    public static void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Appointment>()
            .Property(it => it.NotifiedById)
            .HasColumnName("notified_by")
            .IsRequired(false);

        modelBuilder.Entity<Appointment>()
            .Property(it => it.NotifiedAt)
            .HasColumnName("notified_at")
            .IsRequired(false);
    }
}

public enum AppointmentStatus
{
    None,
	Pending,
	Realized,
	Canceled,
	Count,
}
