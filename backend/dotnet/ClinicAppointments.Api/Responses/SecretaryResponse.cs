using ClinicAppointments.Db.Entities;

namespace ClinicAppointments.Api.Responses;

public record SecretaryResponse(Guid Id, string Name, string Email, string Phone, DateOnly Birthdate, string Cpf, string Cnpj)
{
    static public SecretaryResponse FromEntity(Secretary s) => new(
        s.Id,
        s.Name,
        s.Email,
        s.Phone,
        s.Birthdate,
        s.Cpf,
        s.Cnpj
    );
}
