using System.Security.Claims;
using NutriFlow.Application.Analytics;

namespace NutriFlow.Api.Endpoints;

public static class AnalyticsEndpoints
{
    public static IEndpointRouteBuilder MapAnalyticsEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/analytics")
            .WithTags("Analytics")
            .RequireAuthorization();

        group.MapGet("/premium", GetPremiumAnalytics);
        group.MapGet("/micronutrients", GetMicronutrients);
        return endpoints;
    }

    private static async Task<IResult> GetPremiumAnalytics(
        ClaimsPrincipal principal,
        IPremiumAnalyticsService service,
        int days = 30,
        DateOnly? endDate = null,
        CancellationToken cancellationToken = default)
        => await Execute(principal, service, days, endDate, false, cancellationToken);

    private static async Task<IResult> GetMicronutrients(
        ClaimsPrincipal principal,
        IPremiumAnalyticsService service,
        int days = 30,
        DateOnly? endDate = null,
        CancellationToken cancellationToken = default)
        => await Execute(principal, service, days, endDate, true, cancellationToken);

    private static async Task<IResult> Execute(
        ClaimsPrincipal principal,
        IPremiumAnalyticsService service,
        int days,
        DateOnly? endDate,
        bool micronutrients,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(principal, out var userId)) return Results.Unauthorized();

        try
        {
            var resolvedEndDate = endDate ?? DateOnly.FromDateTime(DateTime.UtcNow);
            return micronutrients
                ? Results.Ok(await service.GetMicronutrientsAsync(userId, days, resolvedEndDate, cancellationToken))
                : Results.Ok(await service.GetAdvancedAsync(userId, days, resolvedEndDate, cancellationToken));
        }
        catch (PremiumFeatureRequiredException exception)
        {
            return Results.Json(new
            {
                error = "premium_required",
                entitlement = exception.Entitlement,
                message = exception.Message
            }, statusCode: StatusCodes.Status403Forbidden);
        }
        catch (ArgumentOutOfRangeException exception)
        {
            return Results.BadRequest(new { error = "invalid_analytics_period", message = exception.Message });
        }
    }

    private static bool TryGetUserId(ClaimsPrincipal principal, out Guid userId)
        => Guid.TryParse(principal.FindFirstValue("sub") ?? principal.FindFirstValue(ClaimTypes.NameIdentifier), out userId);
}
