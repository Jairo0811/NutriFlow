using System.Security.Claims;
using NutriFlow.Application.Billing;

namespace NutriFlow.Api.Endpoints;

public static class BillingEndpoints
{
    public static IEndpointRouteBuilder MapBillingEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/billing")
            .WithTags("Billing")
            .RequireAuthorization();

        group.MapGet("/access", GetAccess);
        group.MapGet("/usage", GetUsageAsync);
        return endpoints;
    }

    private static IResult GetAccess(ClaimsPrincipal principal, ISubscriptionAccessService service)
    {
        if (!TryGetUserId(principal, out var userId))
            return Results.Unauthorized();

        return Results.Ok(service.GetAccess(userId));
    }

    private static async Task<IResult> GetUsageAsync(
        ClaimsPrincipal principal,
        IUsageLimitService service,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(principal, out var userId))
            return Results.Unauthorized();

        return Results.Ok(await service.GetCurrentAsync(userId, cancellationToken));
    }

    private static bool TryGetUserId(ClaimsPrincipal principal, out Guid userId)
        => Guid.TryParse(principal.FindFirstValue("sub") ?? principal.FindFirstValue(ClaimTypes.NameIdentifier), out userId);
}
