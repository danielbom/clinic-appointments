using ClinicAppointments.Api.Queries;

namespace ClinicAppointments.Api.Requests;

class GetAppointmentsParams : CountAppointmentsParams, IPageable
{
    public int? Page { get; set; }
    public int? PageSize { get; set; }
}