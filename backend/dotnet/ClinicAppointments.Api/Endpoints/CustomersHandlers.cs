using ClinicAppointments.Api.Requests;
using ClinicAppointments.Api.Queries;
using ClinicAppointments.Db;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using ClinicAppointments.Db.Entities;
using ClinicAppointments.Api.Validations;

namespace ClinicAppointments.Api.Endpoints;

static class CustomersHandlers
{
    public static async Task<IResult> GetCustomers([AsParameters] GetCustomersParams query, AppDbContext ctx)
    {
        var result = await ctx.Customers.AsNoTracking()
            .ByName(query.Name)
            .ByCpf(query.Cpf)
            .ByPhone(query.Phone)
            .Paginate(query)
            .ToListAsync();
        foreach (var customer in result)
        {
            Console.WriteLine($"Customer: {customer.Name} - {customer.Birthdate}");
        }
        return Results.Ok(result);
    }

    public static IResult CountCustomers([AsParameters] CountCustomersParams query, AppDbContext ctx) =>
        Results.Ok(ctx.Customers.AsNoTracking()
            .ByName(query.Name)
            .ByCpf(query.Cpf)
            .ByPhone(query.Phone)
            .Count());

    public static async Task<IResult> GetCustomer(Guid customerId, AppDbContext ctx) =>
        (await ctx.Customers.AsNoTracking().Where(it => it.Id == customerId)
            .ToListAsync())
            .Select(it => Results.Ok(it))
            .FirstOrDefault(Results.NotFound());

    public static async Task<IResult> CreateCustomer([FromBody] UpsertCustomerBody body, AppDbContext ctx)
    {
        var (result, error) = UpsertCustomerBodyValid.Create2(body);
        if (result is null) return Results.BadRequest(error);

        var customerWithPhone = await ctx.Customers
            .ByPhone(result.Phone)
            .FirstOrDefaultAsync();
        if (customerWithPhone is not null) return Results.BadRequest(error.AlreadyExists(nameof(result.Phone)));

        var customer = new Customer()
        {
            Id = Guid.NewGuid(),
            Name = result.Name,
            Cpf = result.Cpf,
            Email = result.Email,
            Phone = result.Phone,
            Birthdate = result.Birthdate,
        };
        ctx.Customers.Add(customer);
        await ctx.SaveChangesAsync();

        return Results.Json(customer);
    }

    public static async Task<IResult> UpdateCustomer(Guid customerId, [FromBody] UpsertCustomerBody body, AppDbContext ctx)
    {
        var (result, error) = UpsertCustomerBodyValid.Create(body);
        if (result is null) return Results.BadRequest(error);

        var customerWithPhone = await ctx.Customers
            .ByPhone(result.Phone)
            .Where(it => it.Id != customerId)
            .FirstOrDefaultAsync();
        if (customerWithPhone is not null) return Results.BadRequest("customer.phone already exists");

        var customer = await ctx.Customers
            .Where(it => it.Id == customerId)
            .FirstOrDefaultAsync();
        if (customer is null) return Results.BadRequest("customer not found");

        ctx.Entry(customer).CurrentValues.SetValues(result);
        await ctx.SaveChangesAsync();

        return Results.Json(customer);
    }

    public static async Task<IResult> DeleteCustomer(Guid customerId, AppDbContext ctx)
    {
        var customer = await ctx.Customers
            .Where(it => it.Id == customerId)
            .FirstOrDefaultAsync();
        if (customer is null) return Results.BadRequest("customer not found");

        ctx.Customers.Remove(customer);
        await ctx.SaveChangesAsync();

        return Results.NoContent();
    }
}
