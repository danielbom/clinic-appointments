using ClinicAppointments.Db.Entities;
using ClinicAppointments.Db.Functions;

namespace ClinicAppointments.Api.Queries;

static class SecretariesQueries
{
    public static IQueryable<Secretary> ById(this IQueryable<Secretary> secretaries, Guid? id) =>
        id is null ? secretaries : secretaries.Where(it => it.Id.Equals(id));

    public static IQueryable<Secretary> ByName(this IQueryable<Secretary> secretaries, string? name) =>
        string.IsNullOrEmpty(name) ? secretaries : secretaries.Where(it => it.Name.Unaccent().Contains(name.Unaccent()));

    public static IQueryable<Secretary> ByCpf(this IQueryable<Secretary> secretaries, string? cpf) =>
        string.IsNullOrEmpty(cpf) ? secretaries : secretaries.Where(it => it.Cpf.Equals(cpf));

    public static IQueryable<Secretary> ByEmail(this IQueryable<Secretary> secretaries, string? email) =>
        string.IsNullOrEmpty(email) ? secretaries : secretaries.Where(it => it.Email.Equals(email));

    public static IQueryable<Secretary> ByCnpj(this IQueryable<Secretary> secretaries, string? cnpj) =>
        string.IsNullOrEmpty(cnpj) ? secretaries : secretaries.Where(it => it.Cnpj.Equals(cnpj));

    public static IQueryable<Secretary> ByPhone(this IQueryable<Secretary> secretaries, string? phone) =>
        string.IsNullOrEmpty(phone) ? secretaries : secretaries.Where(it => it.Phone.Equals(phone));
}
