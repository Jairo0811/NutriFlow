using System.Security.Claims;
using NutriFlow.Application.Dashboard;

namespace NutriFlow.Api.Endpoints;

public static class DashboardEndpoints
{
    public static IEndpointRouteBuilder MapDashboardEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/dashboard")
            .WithTags("Dashboard")
            .RequireAuthorization();

        group.MapGet("/", GetDailyAsync);
        return endpoints;
    }

    private static async Task<IResult> GetDailyAsync(
        DateOnly? date,
        ClaimsPrincipal principal,
        IDashboardService service,
        CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(principal.FindFirstValue("sub") ?? principal.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
            return Results.Unauthorized();

        try
        {
            var selectedDate = date ?? DateOnly.FromDateTime(DateTime.UtcNow);
            return Results.Ok(await service.GetDailyAsync(userId, selectedDate, cancellationToken));
        }
        catch (InvalidOperationException exception)
        {
            return Results.BadRequest(new { error = exception.Message });
        }
    }
}
