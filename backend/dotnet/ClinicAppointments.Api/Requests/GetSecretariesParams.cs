using ClinicAppointments.Api.Queries;

namespace ClinicAppointments.Api.Requests;

class GetSecretariesParams : CountSecretariesParams, IPageable
{
    public int? Page { get; set; }
    public int? PageSize { get; set; }
}
