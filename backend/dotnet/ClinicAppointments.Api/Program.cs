using ClinicAppointments.Api.Configuration;
using ClinicAppointments.Api.Endpoints;
using ClinicAppointments.Api.Services;
using ClinicAppointments.Db;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add DbContext to the DI container
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
            .UseSnakeCaseNamingConvention());

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddAuthorization();
builder.Services.ConfigureAuthentication(builder.Configuration);

builder.Services.AddSingleton<TokenService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment() || app.Environment.IsEnvironment("Test"))
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/health", HealthHandlers.IsHealth);

app.MapPost("/auth/login", AuthHandlers.Login);

app.MapPost("/auth/refresh", AuthHandlers.Refresh).RequireAuthorization();
app.MapGet("/auth/me", AuthHandlers.Me).RequireAuthorization();

app.MapGet("/appointments", AppointmentsHandlers.GetAppointments).RequireAuthorization();
app.MapGet("/appointments/count", AppointmentsHandlers.CountAppointments).RequireAuthorization();
app.MapGet("/appointments/calendar", AppointmentsHandlers.GetAppointmentsCalendar).RequireAuthorization();
app.MapGet("/appointments/calendar/count", AppointmentsHandlers.CountAppointmentsCalendar).RequireAuthorization();
app.MapGet("/appointments/{appointmentId}", AppointmentsHandlers.GetAppointment).RequireAuthorization();
app.MapPost("/appointments", AppointmentsHandlers.CreateAppointment).RequireAuthorization();
app.MapPut("/appointments/{appointmentId}", AppointmentsHandlers.UpdateAppointment).RequireAuthorization();
app.MapDelete("/appointments/{appointmentId}", AppointmentsHandlers.DeleteAppointment).RequireAuthorization();

app.MapGet("/customers", CustomersHandlers.GetCustomers).RequireAuthorization();
app.MapGet("/customers/count", CustomersHandlers.CountCustomers).RequireAuthorization();
app.MapGet("/customers/{customerId}", CustomersHandlers.GetCustomer).RequireAuthorization();
app.MapPost("/customers", CustomersHandlers.CreateCustomer).RequireAuthorization();
app.MapPut("/customers/{customerId}", CustomersHandlers.UpdateCustomer).RequireAuthorization();
app.MapDelete("/customers/{customerId}", CustomersHandlers.DeleteCustomer).RequireAuthorization();

app.MapGet("/secretaries", SecretariesHandlers.GetSecretaries).RequireAuthorization(policy => policy.RequireRole("admin"));
app.MapGet("/secretaries/count", SecretariesHandlers.CountSecretaries).RequireAuthorization(policy => policy.RequireRole("admin"));
app.MapGet("/secretaries/{secretaryId}", SecretariesHandlers.GetSecretary).RequireAuthorization(policy => policy.RequireRole("admin"));
app.MapPost("/secretaries", SecretariesHandlers.CreateSecretary).RequireAuthorization(policy => policy.RequireRole("admin"));
app.MapPut("/secretaries/{secretaryId}", SecretariesHandlers.UpdateSecretary).RequireAuthorization(policy => policy.RequireRole("admin"));
app.MapDelete("/secretaries/{secretaryId}", SecretariesHandlers.DeleteSecretary).RequireAuthorization(policy => policy.RequireRole("admin"));

app.MapGet("/specialists", SpecialistsHandlers.GetSpecialists).RequireAuthorization();
app.MapGet("/specialists/count", SpecialistsHandlers.CountSpecialists).RequireAuthorization();
app.MapGet("/specialists/{specialistId}", SpecialistsHandlers.GetSpecialist).RequireAuthorization();
app.MapGet("/specialists/{specialistId}/appointments", SpecialistsHandlers.GetSpecialistAppointments).RequireAuthorization();
app.MapGet("/specialists/{specialistId}/specializations", SpecialistsHandlers.GetSpecialistSpecializations).RequireAuthorization();
app.MapGet("/specialists/{specialistId}/services", SpecialistsHandlers.GetSpecialistServices).RequireAuthorization();
app.MapPost("/specialists", SpecialistsHandlers.CreateSpecialist).RequireAuthorization();
app.MapPut("/specialists/{specialistId}", SpecialistsHandlers.UpdateSpecialist).RequireAuthorization();
app.MapDelete("/specialists/{specialistId}", SpecialistsHandlers.DeleteSpecialist).RequireAuthorization();

app.MapGet("/specializations", SpecializationsHandlers.GetSpecializations).RequireAuthorization();
app.MapPost("/specializations", SpecializationsHandlers.CreateSpecialization).RequireAuthorization();
app.MapPut("/specializations/{specializationId}", SpecializationsHandlers.UpdateSpecialization).RequireAuthorization();
app.MapDelete("/specializations/{specializationId}", SpecializationsHandlers.DeleteSpecialization).RequireAuthorization();

app.MapGet("/service-groups", ServiceGroupsHandlers.GetServiceGroups).RequireAuthorization();

app.MapGet("/services", ServicesHandlers.GetServices).RequireAuthorization();
app.MapGet("/services/count", ServicesHandlers.CountServices).RequireAuthorization();
app.MapGet("/services/{serviceId}", ServicesHandlers.GetService).RequireAuthorization();
app.MapPost("/services", ServicesHandlers.CreateService).RequireAuthorization();
app.MapPut("/services/{serviceId}", ServicesHandlers.UpdateService).RequireAuthorization();
app.MapDelete("/services/{serviceId}", ServicesHandlers.DeleteService).RequireAuthorization();

app.MapGet("/services-available", ServicesAvailableHandlers.GetServiceAvailables).RequireAuthorization();
app.MapGet("/services-available/{serviceId}", ServicesAvailableHandlers.GetServiceAvailable).RequireAuthorization();
app.MapPost("/services-available", ServicesAvailableHandlers.CreateServiceAvailable).RequireAuthorization();
app.MapPut("/services-available/{serviceId}", ServicesAvailableHandlers.UpdateServiceAvailable).RequireAuthorization();
app.MapDelete("/services-available/{serviceId}", ServicesAvailableHandlers.DeleteServiceAvailable).RequireAuthorization();

if (app.Environment.IsEnvironment("Test"))
{
    app.MapGet("/test/stats", TestHandlers.GetStats);
    app.MapGet("/test/init", TestHandlers.Init);
    app.MapGet("/test/debug-claims", TestHandlers.DebugClaims);
}

app.Run();
