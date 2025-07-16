using ClinicAppointments.Api.Queries;

namespace ClinicAppointments.Api.Requests;

class GetSpecialistsParams : CountSpecialistsParams, IPageable
{
    public int? Page { get; set; }
    public int? PageSize { get; set; }
}
