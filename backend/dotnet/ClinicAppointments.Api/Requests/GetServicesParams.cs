using ClinicAppointments.Api.Queries;

namespace ClinicAppointments.Api.Requests;

class GetServicesParams : CountServicesParams, IPageable
{
    public int? Page { get; set; }
    public int? PageSize { get; set; }
}
