namespace ClinicAppointments.Api.Queries;

static class PageableQueries
{
    public static IQueryable<T> Paginate<T>(this IQueryable<T> queryable, IPageable query, int page = 0, int pageSize = 20)
        => queryable
            .Skip((query.Page ?? page) * (query.PageSize ?? pageSize))
            .Take(query.PageSize ?? pageSize);
}

interface IPageable
{
    public int? Page { get; }
    public int? PageSize { get; }
}
