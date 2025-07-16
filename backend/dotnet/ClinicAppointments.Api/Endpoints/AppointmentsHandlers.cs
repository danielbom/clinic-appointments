using ClinicAppointments.Api.Requests;
using ClinicAppointments.Api.Queries;
using ClinicAppointments.Db;
using Microsoft.EntityFrameworkCore;
using ClinicAppointments.Db.Entities;
using Microsoft.AspNetCore.Mvc;

namespace ClinicAppointments.Api.Endpoints;

static class AppointmentsHandlers
{
    public static IResult GetAppointments([AsParameters] GetAppointmentsParams query, AppDbContext ctx) =>
        Results.Ok(ctx.Appointments.AsNoTracking()
            .AfterDate(query.StartDate)
            .BeforeDate(query.EndDate)
            .ByCustomer(ctx.Customers, query.Customer)
            .ByService(ctx.ServiceNames, query.ServiceName)
            .BySpecialist(ctx.Specialists, query.Specialist)
            .OrderByDescending(a => a.Date)
            .ThenByDescending(a => a.Time)
            .Paginate(query));

    public static IResult CountAppointments([AsParameters] CountAppointmentsParams query, AppDbContext ctx) =>
        Results.Ok(ctx.Appointments.AsNoTracking()
            .AfterDate(query.StartDate)
            .BeforeDate(query.EndDate)
            .ByCustomer(ctx.Customers, query.Customer)
            .ByService(ctx.ServiceNames, query.ServiceName)
            .BySpecialist(ctx.Specialists, query.Specialist)
            .Count());

    public static async Task<IResult> GetAppointment(Guid appointmentId, AppDbContext ctx) =>
        (await ctx.Appointments.AsNoTracking()
            .Where(it => it.Id == appointmentId)
            .ToListAsync())
            .Select(it => Results.Ok(it))
            .FirstOrDefault(Results.NotFound());

    public static IResult GetAppointmentsCalendar([AsParameters] GetAppointmentsCalendarParams query, AppDbContext ctx) =>
        Results.Ok(ctx.Appointments.AsNoTracking()
            .AfterDate(query.StartDate)
            .BeforeDate(query.EndDate)
            .OrderByDescending(a => a.Date)
            .ThenByDescending(a => a.Time)
            .CalendarSelection(ctx.Specialists));

    public static IResult CountAppointmentsCalendar([AsParameters] GetAppointmentsCalendarParams query, AppDbContext ctx) =>
        Results.Ok(ctx.Appointments.AsNoTracking()
            .AfterDate(query.StartDate)
            .BeforeDate(query.EndDate)
            .Count());

    public static async Task<IResult> CreateAppointment([FromBody] CreateAppointmentBody body, AppDbContext ctx)
    {
        // Validate body properly
        var service = await ctx.Services.AsNoTracking()
            .Where(it => it.Id == body.ServiceId)
            .FirstOrDefaultAsync();
        if (service is null) return Results.BadRequest("service not found");

        var intersections = await ctx.Appointments
            .Intersections(body.Date, body.Time, service.SpecialistId, service.Duration)
            .CountAsync();
        if (intersections > 0) return Results.BadRequest("appointments intersect");

        var appointment = new Appointment()
        {
            Id = Guid.NewGuid(),
            CustomerId = body.CustomerId,
            Date = body.Date,
            Time = body.Time,
            ServiceNameId = service.ServiceNameId,
            SpecialistId = service.SpecialistId,
            Duration = service.Duration,
            Price = service.Price,
            Status = (int)AppointmentStatus.Pending,
        };
        ctx.Appointments.Add(appointment);
        await ctx.SaveChangesAsync();

        return Results.Json(appointment);
    }

    public static async Task<IResult> UpdateAppointment(Guid appointmentId, [FromBody] UpdateAppointmentBody body, AppDbContext ctx)
    {
        // Validate body properly
        var appointment = await ctx.Appointments
            .Where(it => it.Id == appointmentId)
            .FirstOrDefaultAsync();
        if (appointment is null) return Results.BadRequest("appointment not found");
        
        var intersections = await ctx.Appointments
            .Intersections(body.Date, body.Time, appointment.SpecialistId, appointment.Duration)
            .Where(it => it.Id != appointment.Id)
            .CountAsync();
        if (intersections > 0) return Results.BadRequest("appointments intersect");

        appointment.Date = body.Date;
        appointment.Time = body.Time;
        appointment.Status = body.Status;
        await ctx.SaveChangesAsync();

        return Results.Json(appointment);
    }

    public static async Task<IResult> DeleteAppointment(Guid appointmentId, AppDbContext ctx)
    {
        var appointment = await ctx.Appointments
            .Where(it => it.Id == appointmentId)
            .FirstOrDefaultAsync();
        if (appointment is null) return Results.BadRequest("appointment not found");

        ctx.Appointments.Remove(appointment);
        await ctx.SaveChangesAsync();

        return Results.NoContent();
    }
}
