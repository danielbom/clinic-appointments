using Microsoft.EntityFrameworkCore;

namespace ClinicAppointments.Db;

using ClinicAppointments.Db.Entities;
using ClinicAppointments.Db.Functions;
using Microsoft.EntityFrameworkCore.Query.SqlExpressions;

public class AppDbContext : DbContext
{
    public virtual DbSet<Admin> Admins => Set<Admin>();
    public virtual DbSet<Appointment> Appointments => Set<Appointment>();
    public virtual DbSet<Customer> Customers => Set<Customer>();
    public virtual DbSet<Secretary> Secretaries => Set<Secretary>();
    public virtual DbSet<Service> Services => Set<Service>();
    public virtual DbSet<ServiceName> ServiceNames => Set<ServiceName>();
    public virtual DbSet<Specialist> Specialists => Set<Specialist>();
    public virtual DbSet<SpecialistHour> SpecialistHours => Set<SpecialistHour>();
    public virtual DbSet<Specialization> Specializations => Set<Specialization>();

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        Appointment.OnModelCreating(modelBuilder);

        modelBuilder.HasDbFunction(() => CustomFunctions.Unaccent(default))
            .HasTranslation(args => new SqlFunctionExpression(
                functionName: "unaccent",
                arguments: args,
                nullable: false, 
                argumentsPropagateNullability: [false], 
                type: typeof(string),
                null
            ));
    }
}
