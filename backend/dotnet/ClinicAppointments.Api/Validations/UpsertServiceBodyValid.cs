using ClinicAppointments.Api.Requests;

namespace ClinicAppointments.Api.Validations;

record UpsertServiceBodyValid(Guid SpecialistId, Guid ServiceNameId, int Price, TimeSpan Duration)
{
    public static (UpsertServiceBodyValid?, string?) Create(UpsertServiceBody body, bool update = false)
    {
		if (body.Price is null) return (null, "price is required");
		if (body.Duration is null) return (null, "duration is required");

        Guid specialistId = Guid.Empty;
        Guid serviceNameId = Guid.Empty;
        if (!update)
        {
		    if (string.IsNullOrEmpty(body.SpecialistId)) return (null, "specialistId is required");
            if (!Guid.TryParse(body.SpecialistId, out specialistId)) return (null, "specialistId is invalid");
            
		    if (string.IsNullOrEmpty(body.ServiceNameId)) return (null, "serviceNameId is required");
            if (!Guid.TryParse(body.ServiceNameId, out serviceNameId)) return (null, "serviceNameId is invalid");
        }

        if (body.Price < 0) return (null, "price must be a positive value");
        if (body.Duration <= 0) return (null, "duration must be a positive value");

        return (new UpsertServiceBodyValid(specialistId, serviceNameId, (int)body.Price, TimeSpan.FromMinutes((int)body.Duration)), null);
    }

    public static (List<UpsertServiceBodyValid>?, string?) CreateMany(IEnumerable<UpsertServiceBody>? services)
    {
        var resultList = new List<UpsertServiceBodyValid>();
        if (services is not null)
        {
            int i = 0;
            foreach (var service in services)
            {
                    var (result, error) = Create(service);
                    if (result is null)
                    {
                        return (null, $"services[{i}].{error}");
                    }
                    resultList.Add(result);
                    i++;
            }
        }
        return (resultList, null);
    }
}
