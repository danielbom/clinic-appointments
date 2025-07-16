using ClinicAppointments.Db.Entities;
using ClinicAppointments.Db.Functions;

namespace ClinicAppointments.Api.Queries;

static class CustomersQueries
{
    public static IQueryable<Customer> ByName(this IQueryable<Customer> customers, string? name) =>
        string.IsNullOrEmpty(name) ? customers : customers.Where(it => it.Name.Unaccent().Contains(name.Unaccent()));

    public static IQueryable<Customer> ByCpf(this IQueryable<Customer> customers, string? cpf) =>
        string.IsNullOrEmpty(cpf) ? customers : customers.Where(it => it.Cpf.Equals(cpf));

    public static IQueryable<Customer> ByPhone(this IQueryable<Customer> customers, string? phone) =>
        string.IsNullOrEmpty(phone) ? customers : customers.Where(it => it.Phone.Equals(phone));
}
