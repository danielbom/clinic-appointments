using ClinicAppointments.Api.Queries;

namespace ClinicAppointments.Api.Requests;

class GetCustomersParams : CountCustomersParams, IPageable
{
    public int? Page { get; set; }
    public int? PageSize { get; set; }
}
